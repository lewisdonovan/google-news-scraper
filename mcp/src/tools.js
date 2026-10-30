import googleNewsScraper from 'google-news-scraper';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Readability } from '@mozilla/readability';

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const MAX_ARTICLE_CHARS = 20000;

// The scraper logs through winston's console transport, which writes to stdout and would
// corrupt the stdio protocol stream. It never logs at level "none", so this silences it.
const SILENT = { logLevel: 'none' };

// hl/gl are Google's own locale params; ceid is derived from them by the scraper
const localeVars = ({ language, country }) => {
  const vars = {};
  if (language) vars.hl = language;
  if (country) vars.gl = country.toUpperCase();
  return vars;
};

// An optional third-party news API key lets results keep coming when Google rate-limits this IP.
// Claude Desktop passes unset optional settings through as an empty string or the raw placeholder.
export const thirdPartyFromEnv = (env = process.env) => {
  const apikey = env.GOOGLE_NEWS_THIRD_PARTY_APIKEY?.trim();
  if (!apikey || apikey.startsWith('${')) return {};
  return {
    third_party: {
      source: env.GOOGLE_NEWS_THIRD_PARTY_SOURCE?.trim() || 'serpapi',
      apikey,
      primary: env.GOOGLE_NEWS_THIRD_PARTY_PRIMARY?.trim().toLowerCase() !== 'false',
    },
  };
};

// Drop fields that are always empty or duplicated so agents get compact results
const toResult = ({ position, title, link, source, sourceUrl, domain, datetime }) => ({ position, title, link, source, sourceUrl, domain, datetime });

export const searchNews = async ({ query, timeframe = '7d', language, country, limit = 20 }, scrape = googleNewsScraper, env = process.env) => {
  const articles = await scrape({
    ...SILENT,
    ...thirdPartyFromEnv(env),
    searchTerm: query,
    timeframe,
    limit,
    queryVars: localeVars({ language, country }),
  });
  return articles.map(toResult);
};

export const topStories = async ({ topicUrl, language, country, limit = 20 }, scrape = googleNewsScraper, env = process.env) => {
  const articles = await scrape({
    ...SILENT,
    ...thirdPartyFromEnv(env),
    ...(topicUrl ? { baseUrl: topicUrl } : {}),
    limit,
    queryVars: localeVars({ language, country }),
  });
  return articles.map(toResult);
};

export const extractArticle = (html, url) => {
  // Page scripts and CSS errors are noise here, and jsdom would print them to the console
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() });
  const parsed = new Readability(dom.window.document).parse();
  if (!parsed?.textContent?.trim()) return null;
  const text = parsed.textContent.replace(/\n\s*\n+/g, '\n\n').trim();
  return {
    url,
    title: parsed.title || '',
    byline: parsed.byline || '',
    siteName: parsed.siteName || '',
    publishedTime: parsed.publishedTime || '',
    text: text.slice(0, MAX_ARTICLE_CHARS),
    truncated: text.length > MAX_ARTICLE_CHARS,
  };
};

export const getArticleText = async ({ url }, fetchImpl = fetch) => {
  const response = await fetchImpl(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`The page responded with HTTP ${response.status}`);
  const article = extractArticle(await response.text(), response.url || url);
  if (!article) throw new Error('No readable article text found on this page. It may be paywalled or rendered with JavaScript.');
  return article;
};
