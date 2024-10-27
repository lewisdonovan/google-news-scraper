import { Cheerio } from "cheerio";
import { AnyNode } from "domhandler/lib/node";
declare const getTitle: (article: Cheerio<AnyNode>, articleType: string) => string;
export default getTitle;
