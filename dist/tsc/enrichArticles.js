import { createHash } from 'crypto';
export const articleId = (link) => createHash('sha256').update(link).digest('hex').slice(0, 16);
// Publisher hostname without "www.", from the source url or, failing that, the link
export const domainOf = ({ sourceUrl, link }) => {
    for (const url of [sourceUrl, link]) {
        try {
            const { hostname } = new URL(url !== null && url !== void 0 ? url : '');
            if (hostname && hostname !== 'news.google.com')
                return hostname.replace(/^www\./, '');
        }
        catch (_a) { }
    }
    return '';
};
// Fields every article gets, whichever provider served it
const enrichArticles = (articles, { query, retrievedAt }) => articles.map((article, i) => {
    var _a;
    return (Object.assign(Object.assign({}, article), { position: i + 1, id: articleId(article.link), domain: domainOf(article), authors: (_a = article.authors) !== null && _a !== void 0 ? _a : [], query,
        retrievedAt }));
});
export default enrichArticles;
