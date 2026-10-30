import * as cheerio from 'cheerio';
const ARTICLE_TYPES = /Article|BlogPosting|Report/;
const toIso = (value) => {
    const date = new Date(String(value !== null && value !== void 0 ? value : ''));
    return value && !isNaN(date.getTime()) ? date.toISOString() : '';
};
const names = (value) => {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    return list
        .map(item => typeof item === 'string' ? item : item === null || item === void 0 ? void 0 : item.name)
        .filter((name) => typeof name === 'string')
        .map(name => name.trim())
        .filter(name => name && !/^https?:\/\//.test(name));
};
const splitList = (value) => value.split(',').map(item => item.trim()).filter(Boolean);
const unique = (items) => [...new Set(items)];
// The first NewsArticle-like object in the page's JSON-LD, looking inside @graph too
const findArticleLd = ($) => {
    for (const script of $('script[type="application/ld+json"]').toArray()) {
        let data;
        try {
            data = JSON.parse($(script).text());
        }
        catch (_a) {
            continue;
        }
        const nodes = [data].flat().flatMap((node) => { var _a; return (_a = node === null || node === void 0 ? void 0 : node['@graph']) !== null && _a !== void 0 ? _a : [node]; });
        const article = nodes.find((node) => ARTICLE_TYPES.test([node === null || node === void 0 ? void 0 : node['@type']].flat().join(' ')));
        if (article)
            return article;
    }
    return {};
};
// Reads the metadata publishers put in the page head, preferring JSON-LD over meta tags
export const getPageMetadata = (html, pageUrl) => {
    var _a, _b, _c, _d, _e;
    const $ = cheerio.load(html);
    const meta = (...keys) => {
        var _a;
        for (const key of keys) {
            const value = (_a = $(`meta[property="${key}"], meta[name="${key}"]`).first().attr('content')) === null || _a === void 0 ? void 0 : _a.trim();
            if (value)
                return value;
        }
        return '';
    };
    const metaAll = (key) => $(`meta[property="${key}"], meta[name="${key}"]`).toArray()
        .map(el => { var _a, _b; return (_b = (_a = $(el).attr('content')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : ''; }).filter(Boolean);
    const absolute = (url) => {
        try {
            return url ? new URL(url, pageUrl).href : '';
        }
        catch (_a) {
            return '';
        }
    };
    const ld = findArticleLd($);
    const ldKeywords = Array.isArray(ld.keywords) ? ld.keywords.map(String) : splitList(String((_a = ld.keywords) !== null && _a !== void 0 ? _a : ''));
    const ldImage = [ld.image].flat()[0];
    return {
        authors: unique(names(ld.author).length ? names(ld.author) : names([...metaAll('author'), ...metaAll('article:author')])),
        language: ($('html').attr('lang') || meta('og:locale') || String((_b = ld.inLanguage) !== null && _b !== void 0 ? _b : '')).trim(),
        excerpt: meta('description', 'og:description', 'twitter:description') || String((_c = ld.description) !== null && _c !== void 0 ? _c : '').trim(),
        canonicalUrl: absolute($('link[rel="canonical"]').attr('href') || meta('og:url')) || pageUrl,
        publishedAt: toIso(meta('article:published_time') || ld.datePublished),
        modifiedAt: toIso(meta('article:modified_time', 'og:updated_time') || ld.dateModified),
        keywords: unique(ldKeywords.length ? ldKeywords : [
            ...splitList(meta('news_keywords', 'keywords')),
            ...metaAll('article:tag'),
        ]),
        section: meta('article:section') || String((_d = [ld.articleSection].flat()[0]) !== null && _d !== void 0 ? _d : '').trim(),
        image: absolute(meta('og:image', 'twitter:image') || (typeof ldImage === 'string' ? ldImage : (_e = ldImage === null || ldImage === void 0 ? void 0 : ldImage.url) !== null && _e !== void 0 ? _e : '')),
    };
};
