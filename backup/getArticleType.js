const getArticleType = ($, article) => {
  if (
    $(article).find('h4').text() || 
    $(article).find('div > div + div > div a').text()
  ) return "regular";

  if (
    $(article).find('figure').length
  ) {
    return "topicFeatured";
  }

  if (
    $(article).find('> a').text()
  ) return "topicSmall";

  return false;
}

module.exports = {
  default: getArticleType
}