import winston from "winston";
import fetchWithRetry from "../fetchWithRetry";
import { timeAgo } from "../parseFeed";
import { GNSConfig, Article, Articles } from "../types";

const ENDPOINT = 'https://api.hasdata.com/scrape/google/news';

type Result = Record<string, any>;

// news.google.com page paths map onto HasData tokens, e.g.
// /topics/ABC/sections/DEF -> topicToken=ABC&sectionToken=DEF
const PATH_TOKENS: Record<string, string> = {
  topics: 'topicToken',
  publications: 'publicationToken',
  sections: 'sectionToken',
  stories: 'storyToken',
};

// HasData only accepts Google's two-letter language codes plus a few regional ones,
// so a regional hl such as en-GB is sent as its language, en
const REGIONAL_LANGUAGES = new Set(['zh-cn', 'zh-tw', 'zh-hk', 'pt-br', 'pt-pt']);

export const toLanguage = (hl: string): string => {
  const lower = hl.toLowerCase();
  return REGIONAL_LANGUAGES.has(lower) ? lower : lower.split(/[-_]/)[0];
}

export const buildParams = (config: GNSConfig): Record<string, string> => {
  const params: Record<string, string> = {};

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

  // Of Google's locale params only hl and gl mean anything to HasData, and it expects them lowercase
  const { hl, gl } = config.queryVars ?? {};
  if (hl) params.hl = toLanguage(hl);
  if (gl) params.gl = gl.toLowerCase();

  for (const [key, value] of Object.entries(config.third_party?.config ?? {})) {
    if (value !== undefined && value !== null) params[key] = String(value);
  }

  return params;
}

// Some HasData thumbnail URLs arrive with their JSON escapes still in them, e.g. ?w=1200
const unescape = (url: unknown): string => (
  typeof url === 'string'
    ? url.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    : ''
)

const toArticle = (result: Result, now: Date): Article => {
  const published = new Date(result.date);
  const valid = !isNaN(published.getTime());
  let sourceUrl = '';
  try { sourceUrl = new URL(result.link).origin; } catch {}

  return {
    title: result.title ?? '',
    link: result.link ?? '',
    image: unescape(result.thumbnail),
    source: result.source?.name ?? '',
    sourceUrl,
    datetime: valid ? published.toISOString() : '',
    time: valid ? timeAgo(published, now) : '',
    articleType: 'regular',
    ...(result.source?.icon ? { favicon: result.source.icon } : {}),
    rawResult: result,
  };
}

// Story clusters have a title and their articles in stories, but no link of their own,
// so clusters are flattened into their articles
export const toArticles = (json: Result, now: Date = new Date()): Articles => (
  (json.newsResults ?? [])
    .flatMap((result: Result) => result.link
      ? [result]
      : [result.highlight, ...(result.stories ?? [])].filter(Boolean))
    .filter((result: Result) => result.title && result.link)
    .map((result: Result) => toArticle(result, now))
)

const errorMessage = (json: Result): string => (
  json.errorMessage
  ?? json.message
  ?? (Array.isArray(json.errors) ? json.errors.map((e: Result) => [e.field, e.message].filter(Boolean).join(': ')).join('; ') : undefined)
  ?? 'no error message'
)

const fetchHasData = async (config: GNSConfig, logger: winston.Logger): Promise<Articles> => {
  const params = buildParams(config);
  logger.info(`📰 FETCHING NEWS FROM HASDATA: ${JSON.stringify(params)}`);

  const response = await fetchWithRetry(`${ENDPOINT}?${new URLSearchParams(params)}`, {
    headers: { 'x-api-key': config.third_party!.apikey },
  });
  let json: Result = {};
  try { json = JSON.parse(await response.text()); } catch {}
  if (!response.ok || json.requestMetadata?.status === 'error') {
    throw new Error(`HasData responded with ${response.status}: ${errorMessage(json)}`);
  }
  return toArticles(json);
}

export default fetchHasData;
