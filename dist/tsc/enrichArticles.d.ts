import { Article, Articles } from "./types";
export declare const articleId: (link: string) => string;
export declare const domainOf: ({ sourceUrl, link }: Pick<Article, "sourceUrl" | "link">) => string;
type Context = {
    query: string;
    retrievedAt: string;
};
declare const enrichArticles: (articles: Articles, { query, retrievedAt }: Context) => Articles;
export default enrichArticles;
