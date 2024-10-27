import { Cheerio } from "cheerio";
import { AnyNode } from "domhandler/lib/node";
declare const getArticleType: (article: Cheerio<AnyNode>) => string;
export default getArticleType;
