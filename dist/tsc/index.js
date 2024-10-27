var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import getLogger from './getLogger';
import getTitle from './getTitle';
import getArticleType from './getArticleType';
import getPrettyUrl from './getPrettyUrl';
import buildQueryString from './buildQueryString';
import getArticleContent from './getArticleContent';
const googleNewsScraper = (userConfig) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const config = Object.assign({
        prettyURLs: true,
        getArticleContent: false,
        puppeteerArgs: [],
        puppeteerHeadlessMode: true,
        logLevel: 'error',
        timeframe: '7d',
        queryVars: {},
        limit: 99
    }, userConfig);
    const logger = getLogger(config.logLevel);
    const queryVars = (_a = config.queryVars) !== null && _a !== void 0 ? _a : {};
    if (userConfig.searchTerm) {
        queryVars.q = userConfig.searchTerm;
    }
    const queryString = queryVars ? buildQueryString(queryVars) : '';
    const baseUrl = (_b = config.baseUrl) !== null && _b !== void 0 ? _b : `https://news.google.com/search`;
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
    };
    const browser = yield puppeteer.launch(puppeteerConfig);
    const page = yield browser.newPage();
    page.setViewport({ width: 1366, height: 768 });
    page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    page.setRequestInterception(true);
    page.on('request', request => {
        if (!request.isNavigationRequest()) {
            request.continue();
            return;
        }
        const headers = request.headers();
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3';
        headers['Accept-Encoding'] = 'gzip';
        headers['Accept-Language'] = 'en-US,en;q=0.9,es;q=0.8';
        headers['Upgrade-Insecure-Requests'] = "1";
        headers['Referer'] = 'https://www.google.com/';
        request.continue({ headers });
    });
    yield page.setCookie({
        name: "CONSENT",
        value: `YES+cb.${new Date().toISOString().split('T')[0].replace(/-/g, '')}-04-p0.en-GB+FX+667`,
        domain: ".google.com"
    });
    yield page.goto(url, { waitUntil: 'networkidle2' });
    try {
        yield page.$(`[aria-label="Reject all"]`);
        yield Promise.all([
            page.click(`[aria-label="Reject all"]`),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);
    }
    catch (err) { }
    const content = yield page.content();
    const $ = cheerio.load(content);
    const articles = $('article');
    let results = [];
    let i = 0;
    const urlChecklist = [];
    $(articles).each(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const link = ((_c = (_b = (_a = $(this)) === null || _a === void 0 ? void 0 : _a.find('a[href^="./article"]')) === null || _b === void 0 ? void 0 : _b.attr('href')) === null || _c === void 0 ? void 0 : _c.replace('./', 'https://news.google.com/')) || ((_f = (_e = (_d = $(this)) === null || _d === void 0 ? void 0 : _d.find('a[href^="./read"]')) === null || _e === void 0 ? void 0 : _e.attr('href')) === null || _f === void 0 ? void 0 : _f.replace('./', 'https://news.google.com/')) || "";
        link && urlChecklist.push(link);
        const srcset = (_g = $(this).find('figure').find('img').attr('srcset')) === null || _g === void 0 ? void 0 : _g.split(' ');
        const image = srcset && srcset.length
            ? srcset[srcset.length - 2]
            : $(this).find('figure').find('img').attr('src');
        const articleType = getArticleType($(this));
        // TODO: Done up to here
        const title = getTitle($(this), articleType);
        const mainArticle = {
            title,
            "link": link,
            "image": (image === null || image === void 0 ? void 0 : image.startsWith("/")) ? `https://news.google.com${image}` : image || "",
            "source": $(this).find('div[data-n-tid]').text() || "",
            "datetime": ((_j = new Date(((_h = $(this).find('div:last-child time')) === null || _h === void 0 ? void 0 : _h.attr('datetime')) || "")) === null || _j === void 0 ? void 0 : _j.toISOString()) || "",
            "time": $(this).find('div:last-child time').text() || "",
            articleType
        };
        results.push(mainArticle);
        i++;
    });
    if (config.prettyURLs) {
        results = yield Promise.all(results.map(article => {
            const url = getPrettyUrl(article.link, logger);
            if (url) {
                article.link = url;
            }
            return article;
        }));
    }
    if (config.getArticleContent) {
        const filterWords = config.filterWords || [];
        results = yield getArticleContent({ articles: results, browser, filterWords, logger });
    }
    yield page.close();
    yield browser.close();
    const filtered = results.filter(result => result.title);
    return config.limit < results.length ? filtered.slice(0, config.limit) : filtered;
});
export * from "./types";
export default googleNewsScraper;
