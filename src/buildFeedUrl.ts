import { GNSConfig } from "./types"

const RSS_ROOT = 'https://news.google.com/rss';

// Google News serves every page as an RSS feed under /rss, e.g.
// /topics/ABC -> /rss/topics/ABC and /search?q=x -> /rss/search?q=x
const toFeedUrl = (baseUrl: string): URL => {
  const url = new URL(baseUrl);
  if (url.hostname === 'news.google.com' && !url.pathname.startsWith('/rss')) {
    url.pathname = `/rss${url.pathname === '/' ? '' : url.pathname}`;
  }
  return url;
}

const buildFeedUrl = (config: GNSConfig): string => {
  let url: URL;
  if (config.searchTerm) {
    url = new URL(`${RSS_ROOT}/search`);
    const when = config.timeframe ? ` when:${config.timeframe}` : '';
    url.searchParams.set('q', `${config.searchTerm}${when}`);
  } else {
    url = config.baseUrl ? toFeedUrl(config.baseUrl) : new URL(RSS_ROOT);
  }

  for (const [key, value] of Object.entries(config.queryVars ?? {})) {
    url.searchParams.set(key, value);
  }

  // Without a locale Google picks one from the caller's IP, which makes results unpredictable
  if (!url.searchParams.has('hl')) url.searchParams.set('hl', 'en-US');
  if (!url.searchParams.has('gl')) url.searchParams.set('gl', 'US');
  if (!url.searchParams.has('ceid')) {
    const gl = url.searchParams.get('gl');
    const lang = (url.searchParams.get('hl') ?? 'en').split('-')[0];
    url.searchParams.set('ceid', `${gl}:${lang}`);
  }

  return url.toString();
}

export default buildFeedUrl;
