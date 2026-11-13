import winston from "winston";
import fetchWithRetry from "../fetchWithRetry";
import { GNSConfig, Article, Articles } from "../types";

const ENDPOINT = 'https://api.serpbase.dev/google/news/search';

type Result = Record<string, any>;

// SerpBase takes a plain query string, so Google News page paths (topic, section,
// publication and story tokens) have no equivalent: those requests are handed to the scraper
export const buildRequest = (config: GNSConfig): Result => {
  const body: Result = { q: config.searchTerm };

  // SerpBase expects both locale params lowercase, and takes no other Google query vars
  const { hl, gl } = config.queryVars ?? {};
  if (hl) body.hl = hl.toLowerCase();
  if (gl) body.gl = gl.toLowerCase();

  for (const [key, value] of Object.entries(config.third_party?.config ?? {})) {
    if (value !== undefined && value !== null) body[key] = value;
  }

  return body;
}

const toArticle = (result: Result): Article => {
  // source_url points at a google.com/goto redirect, so the publisher's origin comes from the link
  let sourceUrl = '';
  try { sourceUrl = new URL(result.link).origin; } catch {}

  // Thumbnails arrive as base64 data URIs, which would bloat every result; only keep real urls
  const image = typeof result.thumbnail === 'string' && /^https?:\/\//.test(result.thumbnail) ? result.thumbnail : '';

  return {
    title: result.title ?? '',
    link: result.link ?? '',
    image,
    source: result.source ?? '',
    sourceUrl,
    // The API only reports a relative age ("10 hours ago"), so there's no date to normalise
    datetime: '',
    time: result.time ?? result.published_at ?? '',
    articleType: 'regular',
    rawResult: result,
  };
}

// A page without stories sometimes comes back as site navigation (Sign in, Maps, Flights)
const isStory = (result: Result): boolean => (
  Boolean(result?.title && result?.link && result?.source)
)

export const toArticles = (json: Result): Articles => (
  (json.news ?? [])
    .filter(isStory)
    .map((result: Result) => toArticle(result))
)

const fetchSerpBase = async (config: GNSConfig, logger: winston.Logger): Promise<Articles> => {
  if (!config.searchTerm) {
    throw new Error('SerpBase only searches by term, so topic and publication pages fall back to the scraper');
  }

  const body = buildRequest(config);
  logger.info(`📰 FETCHING NEWS FROM SERPBASE: ${JSON.stringify(body)}`);

  const response = await fetchWithRetry(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.third_party!.apikey,
    },
    body: JSON.stringify(body),
  });

  let json: Result = {};
  try { json = JSON.parse(await response.text()); } catch {}
  // Failures (bad key, no credits, upstream error) come back as HTTP 200 with a business
  // status, so the envelope decides success rather than the status code
  if (!response.ok || json.status !== 0) {
    throw new Error(`SerpBase responded with ${response.status} (status ${json.status ?? 'unknown'}): ${json.error ?? 'no error message'}`);
  }

  return toArticles(json);
}

export default fetchSerpBase;
