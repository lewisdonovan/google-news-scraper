const getTitle = ($, article, articleType) => {
  try {
    switch(articleType) {
      case "regular":
        return $(article).find('h4').text() || $(article).find('div > div + div > div a').text()
      case "topicFeatured":
        return $(article).find('a[target=_blank]').text() || $(article).find('button').atrr('aria-label').replace('More - ', '')
      case "topicSmall":
        return $(article).find('a[target=_blank]').text() || $(article).find('button').atrr('aria-label').replace('More - ', '')
    }
  } catch (err) {
    return false;
  }
}

module.exports = {
  default: getTitle
}