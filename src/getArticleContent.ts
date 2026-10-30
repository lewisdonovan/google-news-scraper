import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';
import { Article, Articles, ContentStatus, ExtractArticleContentAndFaviconProps, GetArticleContentProps } from "./types"
import { cleanText } from "./cleanText"
import { getPageMetadata, PageMetadata } from "./pageMetadata"

const verifyMessages = [
  "you are human",
  "are you human",
  "i'm not a robot",
  "recaptcha"
];

type Readable = Pick<NonNullable<ReturnType<Readability['parse']>>, 'byline' | 'lang' | 'excerpt'>;

export const countWords = (text: string): number => text.split(/\s+/).filter(Boolean).length;

// Page metadata fills gaps in what the feed gave us, but never overwrites it
const withMetadata = (article: Article, metadata: PageMetadata, parsed: Readable | null): Article => {
  const { image, authors, language, excerpt, ...rest } = metadata;
  const byline = parsed?.byline?.replace(/^by\s+/i, '').trim();
  return {
    ...article,
    ...rest,
    image: article.image || image,
    authors: article.authors?.length ? article.authors : authors.length ? authors : byline ? [byline] : [],
    language: language || parsed?.lang || '',
    excerpt: excerpt || parsed?.excerpt || '',
  };
}

const getArticleContent = async ({
  articles, browser, filterWords, logger
}: GetArticleContentProps): Promise<Articles> => {
  try {
    const processedArticlesPromises = articles.map(article =>
      extractArticleContentAndFavicon({article, browser, filterWords, logger})
    );

    const processedArticles = await Promise.all(processedArticlesPromises);

    return processedArticles;

  } catch (err) {
    logger.error("getArticleContent ERROR:", err);
    return articles;
  }
}

const extractArticleContentAndFavicon = async ({
  article, browser, filterWords, logger
}: ExtractArticleContentAndFaviconProps): Promise<Article> => {
  const page = await browser.newPage();
  let favicon = '';
  const result = (status: ContentStatus, content = '', extra: Partial<Article> = {}): Article => ({
    ...article, ...extra, content, favicon, contentStatus: status, wordCount: countWords(content),
  });

  try {
    await page.goto(article.link, { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.documentElement.innerHTML);

    favicon = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      return link ? link.getAttribute('href') : '';
    }) ?? "";

    const pageUrl = page.url() || article.link;
    const metadata = getPageMetadata(content, pageUrl);

    const virtualConsole = new VirtualConsole();
    virtualConsole.on("error", logger.error);

    const dom = new JSDOM(content, { url: pageUrl, virtualConsole });
    let reader = new Readability(dom.window.document);
    const articleContent = reader.parse();
    const enriched = withMetadata(article, metadata, articleContent);

    if (!articleContent || !articleContent.textContent) {
      logger.warn("Article content could not be parsed or is empty.", {article});
      return result('unparseable', '', enriched);
    }

    const hasVerifyMessage = verifyMessages.find(w => (articleContent.textContent ?? '').toLowerCase().includes(w));
    if (hasVerifyMessage) {
      logger.warn("Article requires human verification.", {article});
      return result('blocked', '', enriched);
    }

    const cleanedText = cleanText(articleContent.textContent, filterWords || []);

    if (cleanedText.split(' ').length < 100) {
      logger.warn("Article content is too short and likely not valuable.", {article});
      return result('too_short', '', enriched);
    }

    logger.info("SUCCESSFULLY SCRAPED ARTICLE CONTENT:", cleanedText);
    return result('ok', cleanedText, enriched);
  } catch (error) {
    logger.error(error);
    favicon = '';
    return result('error');
  } finally {
    await page.close();
  }
}

export default getArticleContent;
