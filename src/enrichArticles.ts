import { createHash } from 'crypto';
import { Article, Articles } from "./types"

export const articleId = (link: string): string =>
  createHash('sha256').update(link).digest('hex').slice(0, 16);

// Publisher hostname without "www.", from the source url or, failing that, the link
export const domainOf = ({ sourceUrl, link }: Pick<Article, 'sourceUrl' | 'link'>): string => {
  for (const url of [sourceUrl, link]) {
    try {
      const { hostname } = new URL(url ?? '');
      if (hostname && hostname !== 'news.google.com') return hostname.replace(/^www\./, '');
    } catch {}
  }
  return '';
}

type Context = { query: string; retrievedAt: string };

// Fields every article gets, whichever provider served it
const enrichArticles = (articles: Articles, { query, retrievedAt }: Context): Articles =>
  articles.map((article, i) => ({
    ...article,
    position: i + 1,
    id: articleId(article.link),
    domain: domainOf(article),
    authors: article.authors ?? [],
    query,
    retrievedAt,
  }));

export default enrichArticles;
