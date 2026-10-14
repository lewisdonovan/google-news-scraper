var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetchWithRetry from "./fetchWithRetry";
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const TIMEOUT_MS = 15000;
export const getArticleId = (googleUrl) => {
    const match = googleUrl.match(/\/(?:rss\/)?(?:articles|read)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
};
// Older article ids embed the publisher URL directly in their base64 payload
export const decodeLegacyId = (id) => {
    const decoded = Buffer.from(id, 'base64').toString('latin1');
    if (decoded.includes('AU_yqL'))
        return null;
    const match = decoded.match(/https?:\/\/[\x21-\x7e]+/);
    return match ? match[0] : null;
};
// Newer ids are opaque: Google resolves them through its own batchexecute endpoint,
// which needs a signature and timestamp scraped from the article's redirect page
const decodeWithGoogle = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const page = yield fetchWithRetry(`https://news.google.com/rss/articles/${id}`, {
        headers: { 'User-Agent': USER_AGENT },
    }, { attempts: 2, timeoutMs: TIMEOUT_MS });
    const html = yield page.text();
    const signature = (_a = html.match(/data-n-a-sg="([^"]+)"/)) === null || _a === void 0 ? void 0 : _a[1];
    const timestamp = (_b = html.match(/data-n-a-ts="([^"]+)"/)) === null || _b === void 0 ? void 0 : _b[1];
    if (!signature || !timestamp)
        return null;
    const payload = JSON.stringify([
        'garturlreq',
        [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
        id, Number(timestamp), signature,
    ]);
    const response = yield fetchWithRetry('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': USER_AGENT },
        body: 'f.req=' + encodeURIComponent(JSON.stringify([[['Fbv4je', payload, null, 'generic']]])),
    }, { attempts: 2, timeoutMs: TIMEOUT_MS });
    const text = yield response.text();
    const json = JSON.parse(text.slice(text.indexOf('[')));
    const result = JSON.parse(json[0][2]);
    return typeof (result === null || result === void 0 ? void 0 : result[1]) === 'string' ? result[1] : null;
});
const getPrettyUrl = (googleUrl, logger) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = getArticleId(googleUrl);
    if (!id)
        return null;
    try {
        return (_a = decodeLegacyId(id)) !== null && _a !== void 0 ? _a : yield decodeWithGoogle(id);
    }
    catch (error) {
        logger.warn(`Could not resolve publisher URL for ${googleUrl}: ${error}`);
        return null;
    }
});
export default getPrettyUrl;
