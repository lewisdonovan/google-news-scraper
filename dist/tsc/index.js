var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import getLogger from './getLogger';
import buildFeedUrl from './buildFeedUrl';
import parseFeed from './parseFeed';
import getPrettyUrl from './getPrettyUrl';
import mapLimit from './mapLimit';
import getArticleContent from './getArticleContent';
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const PRETTY_URL_CONCURRENCY = 5;
const googleNewsScraper = (userConfig) => __awaiter(void 0, void 0, void 0, function* () {
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
    const url = buildFeedUrl(config);
    logger.info(`📰 SCRAPING NEWS FROM: ${url}`);
    let xml;
    try {
        const response = yield fetch(url, {
            headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
            signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
            logger.error(`Google News responded with ${response.status} for ${url}`);
            return [];
        }
        xml = yield response.text();
    }
    catch (error) {
        logger.error(`Failed to fetch ${url}: ${error}`);
        return [];
    }
    let results = parseFeed(xml)
        .filter(article => article.title)
        .slice(0, Math.max(0, config.limit));
    if (config.prettyURLs) {
        results = yield mapLimit(results, PRETTY_URL_CONCURRENCY, (article) => __awaiter(void 0, void 0, void 0, function* () {
            const prettyUrl = yield getPrettyUrl(article.link, logger);
            return prettyUrl ? Object.assign(Object.assign({}, article), { link: prettyUrl }) : article;
        }));
    }
    if (config.getArticleContent && results.length) {
        let puppeteer;
        try {
            puppeteer = (yield import('puppeteer')).default;
        }
        catch (_a) {
            throw new Error("getArticleContent requires puppeteer. Install it with `npm install puppeteer`.");
        }
        const browser = yield puppeteer.launch({
            headless: config.puppeteerHeadlessMode,
            args: config.puppeteerArgs,
        });
        try {
            const filterWords = config.filterWords || [];
            results = yield getArticleContent({ articles: results, browser, filterWords, logger });
        }
        finally {
            yield browser.close();
        }
    }
    return results;
});
export * from "./types";
export default googleNewsScraper;
