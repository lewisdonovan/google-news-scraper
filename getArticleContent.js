const { Readability } = require('@mozilla/readability');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const verifyMessages = [
  "you are human", 
  "are you human", 
  "i'm not a robot", 
  "recaptcha"
];

const getArticleContent = async (articles, browser, filterWords, logger) => {
  try {
    const processedArticlesPromises = articles.map(article =>
      extractArticleContentAndFavicon(article, browser, filterWords, logger)
    );

    const processedArticles = await Promise.all(processedArticlesPromises);

    return processedArticles;

  } catch (err) {
    logger.error("getArticleContent ERROR:", err);
    return articles;
  }
}

const extractArticleContentAndFavicon = async (article, browser, filterWords, logger) => {
  try {
    const page = await browser.newPage();
    await page.goto(article.link, { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.documentElement.innerHTML);

    const favicon = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      return link ? link.getAttribute('href') : '';
    });

    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.on("error", logger.error);

    const dom = new JSDOM(content, { url: article.link, virtualConsole });
    let reader = new Readability(dom.window.document);
    const articleContent = reader.parse();

    if (!articleContent || !articleContent.textContent) {
      logger.warn("Article content could not be parsed or is empty.", {article});
      return { ...article, content: '', favicon};
    }

    const hasVerifyMessage = verifyMessages.find(w => articleContent.textContent.toLowerCase().includes(w));
    if (hasVerifyMessage) {
      logger.warn("Article requires human verification.", {article});
      return { ...article, content: '', favicon};
    }

    const cleanedText = cleanText(articleContent.textContent, filterWords);
    
    if (cleanedText.split(' ').length < 100) { // Example threshold: 100 words
      logger.warn("Article content is too short and likely not valuable.", {article});
      return { ...article, content: '', favicon };
    }

    logger.info("SUCCESSFULLY SCRAPED ARTICLE CONTENT:", cleanedText);
    return { ...article, content: cleanedText, favicon};
  } catch (error) {
    logger.error(error);
    return { ...article, content: '', favicon: '' };
  }
}

const cleanText = (text, filterWords) => {
  const unwantedKeywords = [
    "subscribe now",
    "sign up",
    "newsletter",
    "subscribe now",
    "sign up for our newsletter",
    "exclusive offer",
    "limited time offer",
    "free trial",
    "download now",
    "join now",
    "register today",
    "special promotion",
    "promotional offer",
    "discount code",
    "early access",
    "sneak peek",
    "save now",
    "don't miss out",
    "act now",
    "last chance",
    "expires soon",
    "giveaway",
    "free access",
    "premium access",
    "unlock full access",
    "buy now",
    "learn more",
    "click here",
    "follow us on",
    "share this article",
    "connect with us",
    "advertisement",
    "sponsored content",
    "partner content",
    "affiliate links",
    "click here",
    "for more information", 
    "you may also like", 
    "we think you'll like", 
    "from our network", 
    ...filterWords
  ];
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.split(' ').length > 4)
    .filter(line => !unwantedKeywords.some(keyword => line.toLowerCase().includes(keyword)))
    .join('\n');
}

module.exports = {
  default: getArticleContent
}