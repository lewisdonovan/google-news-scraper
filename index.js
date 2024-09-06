'use strict'

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const getLogger = require('./logger');
const getTitle = require('./getTitle').default;
const getArticleType = require('./getArticleType').default;
const getPrettyUrl = require('./getPrettyUrl').default;
const buildQueryString = require('./buildQueryString').default;
const getArticleContent = require('./getArticleContent').default;

const googleNewsScraper = async (userConfig) => {

  const config = Object.assign({
    prettyURLs: true,
    getArticleContent: false,
    puppeteerArgs: [],
    puppeteerHeadlessMode: true, 
    logLevel: 'error',
  }, userConfig);

  const logger = getLogger(config.logLevel);

  let queryVars = config.queryVars || {};
  if (userConfig.searchTerm) {
    queryVars.q = userConfig.searchTerm;
  }

  const queryString = queryVars ? buildQueryString(queryVars) : ''
  const baseUrl = config.baseUrl ?? `https://news.google.com/search`
  const timeString = config.timeframe ? ` when:${config.timeframe}` : ''
  const url = `${baseUrl}${queryString}${timeString}`

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
  let results = []
  let i = 0
  const urlChecklist = []

  $(articles).each(function () {
    const link = $(this)?.find('a[href^="./article"]')?.attr('href')?.replace('./', 'https://news.google.com/') || $(this)?.find('a[href^="./read"]')?.attr('href')?.replace('./', 'https://news.google.com/') || false
    link && urlChecklist.push(link);
    const srcset = $(this).find('figure').find('img').attr('srcset')?.split(' ');
    const image = srcset && srcset.length
      ? srcset[srcset.length - 2]
      : $(this).find('figure').find('img').attr('src');
    const articleType = getArticleType($, this);
    const title = getTitle($, this, articleType);
    const mainArticle = {
      title, 
      "link": link,
      "image": image?.startsWith("/") ? `https://news.google.com${image}` : image,
      "source": $(this).find('div[data-n-tid]').text() || false,
      "datetime": new Date($(this).find('div:last-child time').attr('datetime')) || false,
      "time": $(this).find('div:last-child time').text() || false, 
      articleType
    }
    results.push(mainArticle)
    i++
  });

  if (config.prettyURLs) {
    results = await Promise.all(results.map(article => {
      const url = getPrettyUrl(article.link, logger);
      article.link = url;
      return article;
    }));
  }

  if (config.getArticleContent) {
    const filterWords = config.filterWords || [];
    results = await getArticleContent(results, browser, filterWords, logger);
  }

  await page.close();
  await browser.close()

  return results.filter(result => result.title)

}

module.exports = googleNewsScraper;