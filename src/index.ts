import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

import getLogger from './getLogger';
import getTitle from './getTitle';
import getArticleType from './getArticleType';
import getPrettyUrl from './getPrettyUrl';
import buildQueryString from './buildQueryString';
import getArticleContent from './getArticleContent';
import { 
  QueryVars,
  GNSUserConfig, 
  GNSConfig,
  Article,
  Articles
} from "./types"

const googleNewsScraper = async (userConfig: GNSUserConfig) => {
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

  const queryVars: QueryVars = config.queryVars ?? {};
  if (userConfig.searchTerm) {
    queryVars.q = userConfig.searchTerm;
  }

  const queryString = queryVars ? buildQueryString(queryVars) : '';
  const baseUrl = config.baseUrl ?? `https://news.google.com/search`;
  const timeString = config.timeframe ? ` when:${config.timeframe}` : '';
  const url = `${baseUrl}${queryString}${timeString}`;

  logger.info(`📰 SCRAPING NEWS FROM: ${url}`);
  const requiredArgs = [
    '--disable-extensions-except=/path/to/manifest/folder/',
    '--load-extension=/path/to/manifest/folder/',
  ];
  const puppeteerConfig = {
    headless: userConfig.puppeteerHeadlessMode,
    args: puppeteer.defaultArgs().concat(config.puppeteerArgs).filter(Boolean).concat(requiredArgs)
  }
  const browser = await puppeteer.launch(puppeteerConfig)
  const page = await browser.newPage()
  page.setViewport({ width: 1366, height: 768 })
  page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36')
  page.setRequestInterception(true)
  page.on('request', request => {
    if (!request.isNavigationRequest()) {
      request.continue()
      return
    }
    const headers = request.headers()
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
    headers['Accept-Encoding'] = 'gzip'
    headers['Accept-Language'] = 'en-US,en;q=0.9,es;q=0.8'
    headers['Upgrade-Insecure-Requests'] = "1"
    headers['Referer'] = 'https://www.google.com/'
    request.continue({ headers })
  })
  await page.setCookie({
    name: "CONSENT",
    value: `YES+cb.${new Date().toISOString().split('T')[0].replace(/-/g, '')}-04-p0.en-GB+FX+667`,
    domain: ".google.com"
  });
  await page.goto(url, { waitUntil: 'networkidle2' });

  try {
    await page.$(`[aria-label="Reject all"]`);
    await Promise.all([
      page.click(`[aria-label="Reject all"]`),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
  } catch (err) {}

  const content = await page.content();
  const $ = cheerio.load(content);

  const articles = $('article');
  let results: Articles = [];
  let i = 0
  const urlChecklist = []

  $(articles).each(function () {
    const link = $(this)?.find('a[href^="./article"]')?.attr('href')?.replace('./', 'https://news.google.com/') || $(this)?.find('a[href^="./read"]')?.attr('href')?.replace('./', 'https://news.google.com/') || ""
    link && urlChecklist.push(link);
    const srcset = $(this).find('figure').find('img').attr('srcset')?.split(' ');
    const image = srcset && srcset.length
      ? srcset[srcset.length - 2]
      : $(this).find('figure').find('img').attr('src');
    const articleType = getArticleType($(this));
    // TODO: Done up to here

    const title = getTitle($(this), articleType);
    const mainArticle: Article = {
      title, 
      "link": link, 
      "image": image?.startsWith("/") ? `https://news.google.com${image}` : image || "",
      "source": $(this).find('div[data-n-tid]').text() || "",
      "datetime": new Date($(this).find('div:last-child time')?.attr('datetime') || "")?.toISOString() || "",
      "time": $(this).find('div:last-child time').text() || "", 
      articleType
    }
    results.push(mainArticle)
    i++
  });

  if (config.prettyURLs) {
    results = await Promise.all(results.map(article => {
      const url = getPrettyUrl(article.link, logger);
      if (url) {
        article.link = url;
      }
      return article;
    }));
  }

  if (config.getArticleContent) {
    const filterWords = config.filterWords || [];
    results = await getArticleContent({articles: results, browser, filterWords, logger});
  }

  await page.close();
  await browser.close()

  const filtered = results.filter(result => result.title);
  return config.limit < results.length ? filtered.slice(0, config.limit) : filtered;

}

export * from "./types";
export default googleNewsScraper;