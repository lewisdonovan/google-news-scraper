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
import fetchWithRetry from "../fetchWithRetry";
import { timeAgo } from "../parseFeed";
const ENDPOINT = 'https://serpapi.com/search.json';
// news.google.com page paths map onto SerpApi tokens, e.g.
// /topics/ABC/sections/DEF -> topic_token=ABC&section_token=DEF
const PATH_TOKENS = {
    topics: 'topic_token',
    publications: 'publication_token',
    sections: 'section_token',
    stories: 'story_token',
};
export const buildParams = (config) => {
    var _a, _b, _c;
    const params = { engine: 'google_news' };
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
    // Of Google's locale params only hl and gl mean anything to SerpApi, and it expects them lowercase
    const { hl, gl } = (_a = config.queryVars) !== null && _a !== void 0 ? _a : {};
    if (hl)
        params.hl = hl.toLowerCase();
    if (gl)
        params.gl = gl.toLowerCase();
    for (const [key, value] of Object.entries((_c = (_b = config.third_party) === null || _b === void 0 ? void 0 : _b.config) !== null && _c !== void 0 ? _c : {})) {
        if (value !== undefined && value !== null)
            params[key] = String(value);
    }
    params.api_key = config.third_party.apikey;
    return params;
};
const toArticle = (result, now) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const published = new Date(result.iso_date);
    const valid = !isNaN(published.getTime());
    let sourceUrl = '';
    try {
        sourceUrl = new URL(result.link).origin;
    }
    catch (_j) { }
    return Object.assign(Object.assign({ title: (_a = result.title) !== null && _a !== void 0 ? _a : '', link: (_b = result.link) !== null && _b !== void 0 ? _b : '', image: (_c = result.thumbnail) !== null && _c !== void 0 ? _c : '', source: (_g = (_e = (_d = result.source) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : (_f = result.author) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : '', sourceUrl, datetime: valid ? published.toISOString() : '', time: valid ? timeAgo(published, now) : '', articleType: 'regular' }, (((_h = result.source) === null || _h === void 0 ? void 0 : _h.icon) ? { favicon: result.source.icon } : {})), { rawResult: result });
};
// Front pages group articles into story clusters with a highlight and related stories
// instead of a top-level link, so clusters are flattened into their articles
export const toArticles = (json, now = new Date()) => {
    var _a;
    return (((_a = json.news_results) !== null && _a !== void 0 ? _a : [])
        .flatMap((result) => {
        var _a;
        return result.link
            ? [result]
            : [result.highlight, ...((_a = result.stories) !== null && _a !== void 0 ? _a : [])].filter(Boolean);
    })
        .filter((result) => result.title && result.link)
        .map((result) => toArticle(result, now)));
};
const fetchSerpApi = (config, logger) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const params = buildParams(config);
    const { api_key } = params, loggable = __rest(params, ["api_key"]);
    logger.info(`📰 FETCHING NEWS FROM SERPAPI: ${JSON.stringify(loggable)}`);
    const response = yield fetchWithRetry(`${ENDPOINT}?${new URLSearchParams(params)}`);
    let json = {};
    try {
        json = JSON.parse(yield response.text());
    }
    catch (_c) { }
    // An empty search is reported as an error, but with a successful status
    if (!response.ok || (json.error && ((_a = json.search_metadata) === null || _a === void 0 ? void 0 : _a.status) !== 'Success')) {
        throw new Error(`SerpApi responded with ${response.status}: ${(_b = json.error) !== null && _b !== void 0 ? _b : 'no error message'}`);
    }
    return toArticles(json);
});
export default fetchSerpApi;
