import getLogger from './getLogger';
import buildFeedUrl from './buildFeedUrl';
import parseFeed from './parseFeed';
import getPrettyUrl from './getPrettyUrl';
import mapLimit from './mapLimit';
import getArticleContent from './getArticleContent';
import {
  GNSUserConfig,
  GNSConfig,
  Articles
} from "./types"

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const PRETTY_URL_CONCURRENCY = 5;

const googleNewsScraper = async (userConfig: GNSUserConfig): Promise<Articles> => {
  const config: GNSConfig = {
    ...{
      prettyURLs: true,
      getArticleContent: false,
      puppeteerArgs: [],
      puppeteerHeadlessMode: true,
      logLevel: 'error',
      timeframe: '7d',
      queryVars: {},
      limit: 99
    },
    ...userConfig,
  } as GNSConfig;

  const logger = getLogger(config.logLevel);

  const url = buildFeedUrl(config);
  logger.info(`📰 SCRAPING NEWS FROM: ${url}`);

  let xml: string;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      logger.error(`Google News responded with ${response.status} for ${url}`);
      return [];
    }
    xml = await response.text();
  } catch (error) {
    logger.error(`Failed to fetch ${url}: ${error}`);
    return [];
  }

  let results: Articles = parseFeed(xml)
    .filter(article => article.title)
    .slice(0, Math.max(0, config.limit));

  if (config.prettyURLs) {
    results = await mapLimit(results, PRETTY_URL_CONCURRENCY, async article => {
      const prettyUrl = await getPrettyUrl(article.link, logger);
      return prettyUrl ? { ...article, link: prettyUrl } : article;
    });
  }

  if (config.getArticleContent && results.length) {
    let puppeteer;
    try {
      puppeteer = (await import('puppeteer')).default;
    } catch {
      throw new Error("getArticleContent requires puppeteer. Install it with `npm install puppeteer`.");
    }
    const browser = await puppeteer.launch({
      headless: config.puppeteerHeadlessMode,
      args: config.puppeteerArgs,
    });
    try {
      const filterWords = config.filterWords || [];
      results = await getArticleContent({ articles: results, browser, filterWords, logger });
    } finally {
      await browser.close();
    }
  }

  return results;
}

export * from "./types";
export default googleNewsScraper;
