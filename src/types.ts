import type { Browser } from 'puppeteer';
import winston from "winston";

type Timeframe = `${number}${'h' | 'd' | 'm' | 'y'}`;
export type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'verbose';
export type QueryVars = Record<string, string>;

export type SearchParams = 
  | { searchTerm: string; baseUrl?: string }
  | { baseUrl: string; searchTerm?: string };

export type ThirdPartySource = 'serpapi';

// Where an article came from: the built-in scraper or a third-party source
export type Provider = 'scraper' | ThirdPartySource;

export type ThirdPartyConfig = {
  source: ThirdPartySource;
  apikey: string;
  // true: call the provider first and fall back to the scraper if it fails.
  // false: scrape first and only call the provider if the scraper fails.
  primary?: boolean;
  // Passed straight to the provider's API, and wins over anything derived from the top-level config
  config?: Record<string, unknown>;
};

export type GNSUserConfig = SearchParams & {
  prettyURLs?: boolean;
  timeframe?: Timeframe;
  getArticleContent?: boolean;
  puppeteerArgs?: string[];
  puppeteerHeadlessMode?: boolean;
  logLevel?: LogLevel;
  queryVars?: QueryVars;
  filterWords?: string[];
  limit?: number;
  third_party?: ThirdPartyConfig;
};

export type GNSConfig = SearchParams & {
  prettyURLs: boolean;
  timeframe: Timeframe;
  getArticleContent: boolean;
  puppeteerArgs: string[];
  puppeteerHeadlessMode: boolean;
  logLevel: LogLevel;
  queryVars: QueryVars;
  filterWords?: string[];
  limit: number;
  third_party?: ThirdPartyConfig;
};

export type Article = {
  title: string;
  link: string;
  image: string;
  source: string;
  datetime: string;
  time: string;
  articleType: string;
  content?: string;
  favicon?: string;
  sourceUrl?: string;
  provider?: Provider;
  // Only set on articles from a third-party provider: the provider's result, unedited
  rawResult?: Record<string, unknown>;
};

export type Articles = Article[];

export interface GetArticleContentProps {
  articles: Articles
  browser: Browser;
  filterWords: string[];
  logger: winston.Logger;
}

export interface ExtractArticleContentAndFaviconProps {
  article: Article;
  browser: Browser;
  filterWords: string[];
  logger: winston.Logger;
}

