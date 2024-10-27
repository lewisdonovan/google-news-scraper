const getTitle = (article, articleType) => {
    var _a, _b;
    try {
        switch (articleType) {
            case "regular":
                return article.find('h4').text() || article.find('div > div + div > div a').text() || "";
            case "topicFeatured":
                return article.find('a[target=_blank]').text() || ((_a = article.find('button').attr('aria-label')) === null || _a === void 0 ? void 0 : _a.replace('More - ', '')) || "";
            case "topicSmall":
                return article.find('a[target=_blank]').text() || ((_b = article.find('button').attr('aria-label')) === null || _b === void 0 ? void 0 : _b.replace('More - ', '')) || "";
            default:
                return "";
        }
    }
    catch (err) {
        return "";
    }
};
export default getTitle;
