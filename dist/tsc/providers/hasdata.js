var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetchWithRetry from "../fetchWithRetry";
import { timeAgo } from "../parseFeed";
const ENDPOINT = 'https://api.hasdata.com/scrape/google/news';
// news.google.com page paths map onto HasData tokens, e.g.
// /topics/ABC/sections/DEF -> topicToken=ABC&sectionToken=DEF
const PATH_TOKENS = {
    topics: 'topicToken',
    publications: 'publicationToken',
    sections: 'sectionToken',
    stories: 'storyToken',
};
// HasData only accepts Google's two-letter language codes plus a few regional ones,
// so a regional hl such as en-GB is sent as its language, en
const REGIONAL_LANGUAGES = new Set(['zh-cn', 'zh-tw', 'zh-hk', 'pt-br', 'pt-pt']);
export const toLanguage = (hl) => {
    const lower = hl.toLowerCase();
    return REGIONAL_LANGUAGES.has(lower) ? lower : lower.split(/[-_]/)[0];
};
export const buildParams = (config) => {
    var _a, _b, _c;
    const params = {};
    if (config.searchTerm) {
        const when = config.timeframe ? ` when:${config.timeframe}` : '';
        params.q = `${config.searchTerm}${when}`;
    }
    else if (config.baseUrl) {
        const segments = new URL(config.baseUrl).pathname.split('/').filter(Boolean);
        for (let i = 0; i < segments.length - 1; i++) {
            const key = PATH_TOKENS[segments[i]];
            if (key)
                params[key] = segments[i + 1];
        }
    }
    // Of Google's locale params only hl and gl mean anything to HasData, and it expects them lowercase
    const { hl, gl } = (_a = config.queryVars) !== null && _a !== void 0 ? _a : {};
    if (hl)
        params.hl = toLanguage(hl);
    if (gl)
        params.gl = gl.toLowerCase();
    for (const [key, value] of Object.entries((_c = (_b = config.third_party) === null || _b === void 0 ? void 0 : _b.config) !== null && _c !== void 0 ? _c : {})) {
        if (value !== undefined && value !== null)
            params[key] = String(value);
    }
    return params;
};
// Some HasData thumbnail URLs arrive with their JSON escapes still in them, e.g. ?w=1200
const unescape = (url) => (typeof url === 'string'
    ? url.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    : '');
const toArticle = (result, now) => {
    var _a, _b, _c, _d, _e;
    const published = new Date(result.date);
    const valid = !isNaN(published.getTime());
    let sourceUrl = '';
    try {
        sourceUrl = new URL(result.link).origin;
    }
    catch (_f) { }
    return Object.assign(Object.assign({ title: (_a = result.title) !== null && _a !== void 0 ? _a : '', link: (_b = result.link) !== null && _b !== void 0 ? _b : '', image: unescape(result.thumbnail), source: (_d = (_c = result.source) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '', sourceUrl, datetime: valid ? published.toISOString() : '', time: valid ? timeAgo(published, now) : '', articleType: 'regular' }, (((_e = result.source) === null || _e === void 0 ? void 0 : _e.icon) ? { favicon: result.source.icon } : {})), { rawResult: result });
};
// Story clusters have a title and their articles in stories, but no link of their own,
// so clusters are flattened into their articles
export const toArticles = (json, now = new Date()) => {
    var _a;
    return (((_a = json.newsResults) !== null && _a !== void 0 ? _a : [])
        .flatMap((result) => {
        var _a;
        return result.link
            ? [result]
            : [result.highlight, ...((_a = result.stories) !== null && _a !== void 0 ? _a : [])].filter(Boolean);
    })
        .filter((result) => result.title && result.link)
        .map((result) => toArticle(result, now)));
};
const errorMessage = (json) => {
    var _a, _b, _c;
    return ((_c = (_b = (_a = json.errorMessage) !== null && _a !== void 0 ? _a : json.message) !== null && _b !== void 0 ? _b : (Array.isArray(json.errors) ? json.errors.map((e) => [e.field, e.message].filter(Boolean).join(': ')).join('; ') : undefined)) !== null && _c !== void 0 ? _c : 'no error message');
};
const fetchHasData = (config, logger) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const params = buildParams(config);
    logger.info(`📰 FETCHING NEWS FROM HASDATA: ${JSON.stringify(params)}`);
    const response = yield fetchWithRetry(`${ENDPOINT}?${new URLSearchParams(params)}`, {
        headers: { 'x-api-key': config.third_party.apikey },
    });
    let json = {};
    try {
        json = JSON.parse(yield response.text());
    }
    catch (_b) { }
    if (!response.ok || ((_a = json.requestMetadata) === null || _a === void 0 ? void 0 : _a.status) === 'error') {
        throw new Error(`HasData responded with ${response.status}: ${errorMessage(json)}`);
    }
    return toArticles(json);
});
export default fetchHasData;
