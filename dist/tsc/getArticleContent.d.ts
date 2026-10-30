import { Articles, GetArticleContentProps } from "./types";
export declare const countWords: (text: string) => number;
declare const getArticleContent: ({ articles, browser, filterWords, logger }: GetArticleContentProps) => Promise<Articles>;
export default getArticleContent;
