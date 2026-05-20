'use strict'

const getTitle = (article, articleType) => {
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

module.exports = getTitle
