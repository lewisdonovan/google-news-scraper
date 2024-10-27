import { Browser } from 'puppeteer';
import winston from "winston";

type Timeframe = `${number}${'h' | 'd' | 'm' | 'y'}`;
export type LogLevel = 'none' | 'error' | 'warn' | 'info' | 'verbose';
export type QueryVars = Record<string, string>;

export type SearchParams = 
  | { searchTerm: string; baseUrl?: string }
  | { baseUrl: string; searchTerm?: string };

export type GNSUserConfig = SearchParams & {
  prettyURLs?: boolean;
  timeframe?: Timeframe;
  getArticleContent?: boolean;
  puppeteerArgs?: string[];
  puppeteerHeadlessMode?: boolean;
  logLevel?: LogLevel;
  queryVars?: QueryVars;
  filterWords?: string[];
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