import { Cheerio } from "cheerio";
import { AnyNode } from "domhandler/lib/node";

const getTitle = (article: Cheerio<AnyNode>, articleType: string): string => {
  try {
    switch(articleType) {
      case "regular":
        return (article.find('h4').text() || article.find('div > div + div > div a').text() || "").trim() || ""
      case "topicFeatured":
        return (article.find('a[target=_blank]').text() || (article.find('button').attr('aria-label')?.replace('More - ', '')) || "").trim() || ""
      case "topicSmall":
        return (article.find('a[target=_blank]').text() || (article.find('button').attr('aria-label')?.replace('More - ', '')) || "").trim() || ""
      default:
        return "";
    }
  } catch (err) {
    return "";
  }
}

export default getTitle;