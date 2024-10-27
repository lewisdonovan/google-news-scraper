var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';
const verifyMessages = [
    "you are human",
    "are you human",
    "i'm not a robot",
    "recaptcha"
];
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
    try {
        const page = yield browser.newPage();
        yield page.goto(article.link, { waitUntil: 'networkidle2' });
        const content = yield page.evaluate(() => document.documentElement.innerHTML);
        const favicon = (_b = yield page.evaluate(() => {
            const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            return link ? link.getAttribute('href') : '';
        })) !== null && _b !== void 0 ? _b : "";
        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", logger.error);
        const dom = new JSDOM(content, { url: article.link, virtualConsole });
        let reader = new Readability(dom.window.document);
        const articleContent = reader.parse();
        if (!articleContent || !articleContent.textContent) {
            logger.warn("Article content could not be parsed or is empty.", { article });
            return Object.assign(Object.assign({}, article), { content: '', favicon });
        }
        const hasVerifyMessage = verifyMessages.find(w => articleContent.textContent.toLowerCase().includes(w));
        if (hasVerifyMessage) {
            logger.warn("Article requires human verification.", { article });
            return Object.assign(Object.assign({}, article), { content: '', favicon });
        }
        const cleanedText = cleanText(articleContent.textContent, filterWords);
        if (cleanedText.split(' ').length < 100) { // Example threshold: 100 words
            logger.warn("Article content is too short and likely not valuable.", { article });
            return Object.assign(Object.assign({}, article), { content: '', favicon });
        }
        logger.info("SUCCESSFULLY SCRAPED ARTICLE CONTENT:", cleanedText);
        return Object.assign(Object.assign({}, article), { content: cleanedText, favicon });
    }
    catch (error) {
        logger.error(error);
        return Object.assign(Object.assign({}, article), { content: '', favicon: '' });
    }
});
const cleanText = (text, filterWords) => {
    const unwantedKeywords = [
        "subscribe now",
        "sign up",
        "newsletter",
        "subscribe now",
        "sign up for our newsletter",
        "exclusive offer",
        "limited time offer",
        "free trial",
        "download now",
        "join now",
        "register today",
        "special promotion",
        "promotional offer",
        "discount code",
        "early access",
        "sneak peek",
        "save now",
        "don't miss out",
        "act now",
        "last chance",
        "expires soon",
        "giveaway",
        "free access",
        "premium access",
        "unlock full access",
        "buy now",
        "learn more",
        "click here",
        "follow us on",
        "share this article",
        "connect with us",
        "advertisement",
        "sponsored content",
        "partner content",
        "affiliate links",
        "click here",
        "for more information",
        "you may also like",
        "we think you'll like",
        "from our network",
        ...filterWords
    ];
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.split(' ').length > 4)
        .filter(line => !unwantedKeywords.some(keyword => line.toLowerCase().includes(keyword)))
        .join('\n');
};
export default getArticleContent;
