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
export declare const getPageMetadata: (html: string, pageUrl: string) => PageMetadata;
