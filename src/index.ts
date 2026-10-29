import getLogger from './getLogger';
import buildFeedUrl from './buildFeedUrl';
import parseFeed from './parseFeed';
import getPrettyUrl from './getPrettyUrl';
import mapLimit from './mapLimit';
import fetchWithRetry from './fetchWithRetry';
import getArticleContent from './getArticleContent';
import fetchThirdParty, { isSupportedSource } from './providers';
import winston from 'winston';
import {
  GNSUserConfig,
  GNSConfig,
  Articles,
  Provider,
  ThirdPartySource
} from "./types"

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const PRETTY_URL_CONCURRENCY = 5;

type Source = [Provider, () => Promise<Articles>];

// Throws when Google can't be reached, so a third-party provider can step in
const scrape = async (config: GNSConfig, logger: winston.Logger): Promise<Articles> => {
  const url = buildFeedUrl(config);
  logger.info(`📰 SCRAPING NEWS FROM: ${url}`);

  const response = await fetchWithRetry(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
  }).catch(error => { throw new Error(`Failed to fetch ${url}: ${error}`); });
  if (!response.ok) throw new Error(`Google News responded with ${response.status} for ${url}`);
  const xml = await response.text();

  let results: Articles = parseFeed(xml)
    .filter(article => article.title)
    .slice(0, Math.max(0, config.limit));

  if (config.prettyURLs) {
    results = await mapLimit(results, PRETTY_URL_CONCURRENCY, async article => {
      const prettyUrl = await getPrettyUrl(article.link, logger);
      return prettyUrl ? { ...article, link: prettyUrl } : article;
    });
  }

  return results;
}

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

  const thirdParty = config.third_party;
  if (thirdParty && !isSupportedSource(thirdParty.source)) {
    throw new Error(`Unsupported third_party source "${thirdParty.source}". Supported sources: serpapi.`);
  }
  if (thirdParty && !thirdParty.apikey) {
    logger.warn('third_party has no apikey, so only the scraper will be used');
  }

  const scraper: Source = ['scraper', () => scrape(config, logger)];
  const provider: Source = [thirdParty?.source as ThirdPartySource, () => fetchThirdParty(config, logger)];
  const sources = !thirdParty?.apikey
    ? [scraper]
    : thirdParty.primary === false ? [scraper, provider] : [provider, scraper];

  let results: Articles = [];
  for (const [i, [name, fetchArticles]] of sources.entries()) {
    try {
      results = (await fetchArticles())
        .slice(0, Math.max(0, config.limit))
        .map(article => ({ ...article, provider: name }));
      break;
    } catch (error) {
      const fallingBack = i < sources.length - 1;
      logger[fallingBack ? 'warn' : 'error'](`${error instanceof Error ? error.message : error}${fallingBack ? ', falling back' : ''}`);
    }
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
