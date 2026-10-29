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
import fetchWithRetry from './fetchWithRetry';
import getArticleContent from './getArticleContent';
import fetchThirdParty, { isSupportedSource } from './providers';
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const PRETTY_URL_CONCURRENCY = 5;
// Throws when Google can't be reached, so a third-party provider can step in
const scrape = (config, logger) => __awaiter(void 0, void 0, void 0, function* () {
    const url = buildFeedUrl(config);
    logger.info(`📰 SCRAPING NEWS FROM: ${url}`);
    const response = yield fetchWithRetry(url, {
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9' },
    }).catch(error => { throw new Error(`Failed to fetch ${url}: ${error}`); });
    if (!response.ok)
        throw new Error(`Google News responded with ${response.status} for ${url}`);
    const xml = yield response.text();
    let results = parseFeed(xml)
        .filter(article => article.title)
        .slice(0, Math.max(0, config.limit));
    if (config.prettyURLs) {
        results = yield mapLimit(results, PRETTY_URL_CONCURRENCY, (article) => __awaiter(void 0, void 0, void 0, function* () {
            const prettyUrl = yield getPrettyUrl(article.link, logger);
            return prettyUrl ? Object.assign(Object.assign({}, article), { link: prettyUrl }) : article;
        }));
    }
    return results;
});
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
    const thirdParty = config.third_party;
    if (thirdParty && !isSupportedSource(thirdParty.source)) {
        throw new Error(`Unsupported third_party source "${thirdParty.source}". Supported sources: serpapi.`);
    }
    if (thirdParty && !thirdParty.apikey) {
        logger.warn('third_party has no apikey, so only the scraper will be used');
    }
    const scraper = ['scraper', () => scrape(config, logger)];
    const provider = [thirdParty === null || thirdParty === void 0 ? void 0 : thirdParty.source, () => fetchThirdParty(config, logger)];
    const sources = !(thirdParty === null || thirdParty === void 0 ? void 0 : thirdParty.apikey)
        ? [scraper]
        : thirdParty.primary === false ? [scraper, provider] : [provider, scraper];
    let results = [];
    for (const [i, [name, fetchArticles]] of sources.entries()) {
        try {
            results = (yield fetchArticles())
                .slice(0, Math.max(0, config.limit))
                .map(article => (Object.assign(Object.assign({}, article), { provider: name })));
            break;
        }
        catch (error) {
            const fallingBack = i < sources.length - 1;
            logger[fallingBack ? 'warn' : 'error'](`${error instanceof Error ? error.message : error}${fallingBack ? ', falling back' : ''}`);
        }
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
