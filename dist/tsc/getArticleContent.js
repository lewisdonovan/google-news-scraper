var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';
import { cleanText } from "./cleanText";
import { getPageMetadata } from "./pageMetadata";
const verifyMessages = [
    "you are human",
    "are you human",
    "i'm not a robot",
    "recaptcha"
];
export const countWords = (text) => text.split(/\s+/).filter(Boolean).length;
// Page metadata fills gaps in what the feed gave us, but never overwrites it
const withMetadata = (article, metadata, parsed) => {
    var _a, _b;
    const { image, authors, language, excerpt } = metadata, rest = __rest(metadata, ["image", "authors", "language", "excerpt"]);
    const byline = (_a = parsed === null || parsed === void 0 ? void 0 : parsed.byline) === null || _a === void 0 ? void 0 : _a.replace(/^by\s+/i, '').trim();
    return Object.assign(Object.assign(Object.assign({}, article), rest), { image: article.image || image, authors: ((_b = article.authors) === null || _b === void 0 ? void 0 : _b.length) ? article.authors : authors.length ? authors : byline ? [byline] : [], language: language || (parsed === null || parsed === void 0 ? void 0 : parsed.lang) || '', excerpt: excerpt || (parsed === null || parsed === void 0 ? void 0 : parsed.excerpt) || '' });
};
const getArticleContent = (_a) => __awaiter(void 0, [_a], void 0, function* ({ articles, browser, filterWords, logger }) {
    try {
        const processedArticlesPromises = articles.map(article => extractArticleContentAndFavicon({ article, browser, filterWords, logger }));
        const processedArticles = yield Promise.all(processedArticlesPromises);
        return processedArticles;
    }
    catch (err) {
        logger.error("getArticleContent ERROR:", err);
        return articles;
    }
});
const extractArticleContentAndFavicon = (_a) => __awaiter(void 0, [_a], void 0, function* ({ article, browser, filterWords, logger }) {
    var _b;
    const page = yield browser.newPage();
    let favicon = '';
    const result = (status, content = '', extra = {}) => (Object.assign(Object.assign(Object.assign({}, article), extra), { content, favicon, contentStatus: status, wordCount: countWords(content) }));
    try {
        yield page.goto(article.link, { waitUntil: 'networkidle2' });
        const content = yield page.evaluate(() => document.documentElement.innerHTML);
        favicon = (_b = yield page.evaluate(() => {
            const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            return link ? link.getAttribute('href') : '';
        })) !== null && _b !== void 0 ? _b : "";
        const pageUrl = page.url() || article.link;
        const metadata = getPageMetadata(content, pageUrl);
        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", logger.error);
        const dom = new JSDOM(content, { url: pageUrl, virtualConsole });
        let reader = new Readability(dom.window.document);
        const articleContent = reader.parse();
        const enriched = withMetadata(article, metadata, articleContent);
        if (!articleContent || !articleContent.textContent) {
            logger.warn("Article content could not be parsed or is empty.", { article });
            return result('unparseable', '', enriched);
        }
        const hasVerifyMessage = verifyMessages.find(w => { var _a; return ((_a = articleContent.textContent) !== null && _a !== void 0 ? _a : '').toLowerCase().includes(w); });
        if (hasVerifyMessage) {
            logger.warn("Article requires human verification.", { article });
            return result('blocked', '', enriched);
        }
        const cleanedText = cleanText(articleContent.textContent, filterWords || []);
        if (cleanedText.split(' ').length < 100) {
            logger.warn("Article content is too short and likely not valuable.", { article });
            return result('too_short', '', enriched);
        }
        logger.info("SUCCESSFULLY SCRAPED ARTICLE CONTENT:", cleanedText);
        return result('ok', cleanedText, enriched);
    }
    catch (error) {
        logger.error(error);
        favicon = '';
        return result('error');
    }
    finally {
        yield page.close();
    }
});
export default getArticleContent;
