import { Articles, GetArticleContentProps } from "./types";
declare const getArticleContent: ({ articles, browser, filterWords, logger }: GetArticleContentProps) => Promise<Articles>;
export default getArticleContent;
