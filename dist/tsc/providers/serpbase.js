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
const ENDPOINT = 'https://api.serpbase.dev/google/news/search';
// SerpBase takes a plain query string, so Google News page paths (topic, section,
// publication and story tokens) have no equivalent: those requests are handed to the scraper
export const buildRequest = (config) => {
    var _a, _b, _c;
    const body = { q: config.searchTerm };
    // SerpBase expects both locale params lowercase, and takes no other Google query vars
    const { hl, gl } = (_a = config.queryVars) !== null && _a !== void 0 ? _a : {};
    if (hl)
        body.hl = hl.toLowerCase();
    if (gl)
        body.gl = gl.toLowerCase();
    for (const [key, value] of Object.entries((_c = (_b = config.third_party) === null || _b === void 0 ? void 0 : _b.config) !== null && _c !== void 0 ? _c : {})) {
        if (value !== undefined && value !== null)
            body[key] = value;
    }
    return body;
};
const toArticle = (result) => {
    var _a, _b, _c, _d, _e;
    // source_url points at a google.com/goto redirect, so the publisher's origin comes from the link
    let sourceUrl = '';
    try {
        sourceUrl = new URL(result.link).origin;
    }
    catch (_f) { }
    // Thumbnails arrive as base64 data URIs, which would bloat every result; only keep real urls
    const image = typeof result.thumbnail === 'string' && /^https?:\/\//.test(result.thumbnail) ? result.thumbnail : '';
    return {
        title: (_a = result.title) !== null && _a !== void 0 ? _a : '',
        link: (_b = result.link) !== null && _b !== void 0 ? _b : '',
        image,
        source: (_c = result.source) !== null && _c !== void 0 ? _c : '',
        sourceUrl,
        // The API only reports a relative age ("10 hours ago"), so there's no date to normalise
        datetime: '',
        time: (_e = (_d = result.time) !== null && _d !== void 0 ? _d : result.published_at) !== null && _e !== void 0 ? _e : '',
        articleType: 'regular',
        rawResult: result,
    };
};
// A page without stories sometimes comes back as site navigation (Sign in, Maps, Flights)
const isStory = (result) => (Boolean((result === null || result === void 0 ? void 0 : result.title) && (result === null || result === void 0 ? void 0 : result.link) && (result === null || result === void 0 ? void 0 : result.source)));
export const toArticles = (json) => {
    var _a;
    return (((_a = json.news) !== null && _a !== void 0 ? _a : [])
        .filter(isStory)
        .map((result) => toArticle(result)));
};
const fetchSerpBase = (config, logger) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!config.searchTerm) {
        throw new Error('SerpBase only searches by term, so topic and publication pages fall back to the scraper');
    }
    const body = buildRequest(config);
    logger.info(`📰 FETCHING NEWS FROM SERPBASE: ${JSON.stringify(body)}`);
    const response = yield fetchWithRetry(ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': config.third_party.apikey,
        },
        body: JSON.stringify(body),
    });
    let json = {};
    try {
        json = JSON.parse(yield response.text());
    }
    catch (_c) { }
    // Failures (bad key, no credits, upstream error) come back as HTTP 200 with a business
    // status, so the envelope decides success rather than the status code
    if (!response.ok || json.status !== 0) {
        throw new Error(`SerpBase responded with ${response.status} (status ${(_a = json.status) !== null && _a !== void 0 ? _a : 'unknown'}): ${(_b = json.error) !== null && _b !== void 0 ? _b : 'no error message'}`);
    }
    return toArticles(json);
});
export default fetchSerpBase;
