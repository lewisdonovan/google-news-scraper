import * as cheerio from 'cheerio';

export type PageMetadata = {
  authors: string[];
  language: string;
  excerpt: string;
  canonicalUrl: string;
  publishedAt: string;
  modifiedAt: string;
  keywords: string[];
  section: string;
  image: string;
};

type JsonLd = Record<string, any>;

const ARTICLE_TYPES = /Article|BlogPosting|Report/;

const toIso = (value: unknown): string => {
  const date = new Date(String(value ?? ''));
  return value && !isNaN(date.getTime()) ? date.toISOString() : '';
}

const names = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list
    .map(item => typeof item === 'string' ? item : item?.name)
    .filter((name): name is string => typeof name === 'string')
    .map(name => name.trim())
    .filter(name => name && !/^https?:\/\//.test(name));
}

const splitList = (value: string): string[] =>
  value.split(',').map(item => item.trim()).filter(Boolean);

const unique = (items: string[]): string[] => [...new Set(items)];

// The first NewsArticle-like object in the page's JSON-LD, looking inside @graph too
const findArticleLd = ($: cheerio.CheerioAPI): JsonLd => {
  for (const script of $('script[type="application/ld+json"]').toArray()) {
    let data: unknown;
    try { data = JSON.parse($(script).text()); } catch { continue; }
    const nodes = [data].flat().flatMap((node: any) => node?.['@graph'] ?? [node]);
    const article = nodes.find((node: any) => ARTICLE_TYPES.test([node?.['@type']].flat().join(' ')));
    if (article) return article;
  }
  return {};
}

// Reads the metadata publishers put in the page head, preferring JSON-LD over meta tags
export const getPageMetadata = (html: string, pageUrl: string): PageMetadata => {
  const $ = cheerio.load(html);
  const meta = (...keys: string[]): string => {
    for (const key of keys) {
      const value = $(`meta[property="${key}"], meta[name="${key}"]`).first().attr('content')?.trim();
      if (value) return value;
    }
    return '';
  };
  const metaAll = (key: string): string[] =>
    $(`meta[property="${key}"], meta[name="${key}"]`).toArray()
      .map(el => $(el).attr('content')?.trim() ?? '').filter(Boolean);
  const absolute = (url: string): string => {
    try { return url ? new URL(url, pageUrl).href : ''; } catch { return ''; }
  };

  const ld = findArticleLd($);
  const ldKeywords = Array.isArray(ld.keywords) ? ld.keywords.map(String) : splitList(String(ld.keywords ?? ''));
  const ldImage = [ld.image].flat()[0];

  return {
    authors: unique(names(ld.author).length ? names(ld.author) : names([...metaAll('author'), ...metaAll('article:author')])),
    language: ($('html').attr('lang') || meta('og:locale') || String(ld.inLanguage ?? '')).trim(),
    excerpt: meta('description', 'og:description', 'twitter:description') || String(ld.description ?? '').trim(),
    canonicalUrl: absolute($('link[rel="canonical"]').attr('href') || meta('og:url')) || pageUrl,
    publishedAt: toIso(meta('article:published_time') || ld.datePublished),
    modifiedAt: toIso(meta('article:modified_time', 'og:updated_time') || ld.dateModified),
    keywords: unique(ldKeywords.length ? ldKeywords : [
      ...splitList(meta('news_keywords', 'keywords')),
      ...metaAll('article:tag'),
    ]),
    section: meta('article:section') || String([ld.articleSection].flat()[0] ?? '').trim(),
    image: absolute(meta('og:image', 'twitter:image') || (typeof ldImage === 'string' ? ldImage : ldImage?.url ?? '')),
  };
}
