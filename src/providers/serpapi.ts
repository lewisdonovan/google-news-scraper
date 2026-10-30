import winston from "winston";
import fetchWithRetry from "../fetchWithRetry";
import { timeAgo } from "../parseFeed";
import { GNSConfig, Article, Articles } from "../types";

const ENDPOINT = 'https://serpapi.com/search.json';

type Result = Record<string, any>;

// news.google.com page paths map onto SerpApi tokens, e.g.
// /topics/ABC/sections/DEF -> topic_token=ABC&section_token=DEF
const PATH_TOKENS: Record<string, string> = {
  topics: 'topic_token',
  publications: 'publication_token',
  sections: 'section_token',
  stories: 'story_token',
};

export const buildParams = (config: GNSConfig): Record<string, string> => {
  const params: Record<string, string> = { engine: 'google_news' };

  if (config.searchTerm) {
    const when = config.timeframe ? ` when:${config.timeframe}` : '';
    params.q = `${config.searchTerm}${when}`;
  } else if (config.baseUrl) {
    const segments = new URL(config.baseUrl).pathname.split('/').filter(Boolean);
    for (let i = 0; i < segments.length - 1; i++) {
      const key = PATH_TOKENS[segments[i]];
      if (key) params[key] = segments[i + 1];
    }
  }

  // Of Google's locale params only hl and gl mean anything to SerpApi, and it expects them lowercase
  const { hl, gl } = config.queryVars ?? {};
  if (hl) params.hl = hl.toLowerCase();
  if (gl) params.gl = gl.toLowerCase();

  for (const [key, value] of Object.entries(config.third_party?.config ?? {})) {
    if (value !== undefined && value !== null) params[key] = String(value);
  }
  params.api_key = config.third_party!.apikey;

  return params;
}

const authorsOf = (result: Result): string[] =>
  [...(result.source?.authors ?? []), result.author?.name]
    .filter((name): name is string => typeof name === 'string' && name.trim() !== '');

const toArticle = (result: Result, now: Date): Article => {
  const published = new Date(result.iso_date);
  const valid = !isNaN(published.getTime());
  let sourceUrl = '';
  try { sourceUrl = new URL(result.link).origin; } catch {}

  return {
    title: result.title ?? '',
    link: result.link ?? '',
    image: result.thumbnail ?? '',
    source: result.source?.name ?? result.author?.name ?? '',
    sourceUrl,
    datetime: valid ? published.toISOString() : '',
    time: valid ? timeAgo(published, now) : '',
    articleType: 'regular',
    ...(result.source?.icon ? { favicon: result.source.icon } : {}),
    authors: authorsOf(result),
    rawResult: result,
  };
}

// Front pages group articles into story clusters with a highlight and related stories
// instead of a top-level link, so clusters are flattened into their articles
export const toArticles = (json: Result, now: Date = new Date()): Articles => (
  (json.news_results ?? [])
    .flatMap((result: Result) => result.link
      ? [result]
      : [result.highlight, ...(result.stories ?? [])].filter(Boolean))
    .filter((result: Result) => result.title && result.link)
    .map((result: Result) => toArticle(result, now))
)

const fetchSerpApi = async (config: GNSConfig, logger: winston.Logger): Promise<Articles> => {
  const params = buildParams(config);
  const { api_key, ...loggable } = params;
  logger.info(`📰 FETCHING NEWS FROM SERPAPI: ${JSON.stringify(loggable)}`);

  const response = await fetchWithRetry(`${ENDPOINT}?${new URLSearchParams(params)}`);
  let json: Result = {};
  try { json = JSON.parse(await response.text()); } catch {}
  // An empty search is reported as an error, but with a successful status
  if (!response.ok || (json.error && json.search_metadata?.status !== 'Success')) {
    throw new Error(`SerpApi responded with ${response.status}: ${json.error ?? 'no error message'}`);
  }
  return toArticles(json);
}

export default fetchSerpApi;
