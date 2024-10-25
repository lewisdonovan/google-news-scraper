import { Cheerio } from "cheerio";
import { AnyNode } from "domhandler/lib/node";

const getArticleType = (article: Cheerio<AnyNode>): string => {
  if (
    article.find('h4').text() || 
    article.find('div > div + div > div a').text()
  ) return "regular";

  if (
    article.find('figure').length
  ) {
    return "topicFeatured";
  }

  if (
    article.find('> a').text()
  ) return "topicSmall";

  return "";
}

export default getArticleType;