const { Readability } = require('@mozilla/readability');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {});

const verifyMessages = [
  "you are human", 
  "are you human", 
  "i'm not a robot", 
  "recaptcha"
];

const getArticleContent = async (articles, browser, filterWords) => {
  try {
    const processedArticlesPromises = articles.map(article =>
      extractArticleContentAndFavicon(article, browser, filterWords)
    );

    const processedArticles = await Promise.all(processedArticlesPromises);

    return processedArticles;

  } catch (err) {
    // console.log("getArticleContent ERROR:", err);
    return articles;
  }
}

const extractArticleContentAndFavicon = async (article, browser, filterWords) => {
  try {
    const page = await browser.newPage();
    await page.goto(article.link, { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => document.documentElement.innerHTML);

    const favicon = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      return link ? link.getAttribute('href') : '';
    });

    const dom = new JSDOM(content, { url: article.link, virtualConsole });
    let reader = new Readability(dom.window.document);
    const articleContent = reader.parse();

    if (!articleContent || !articleContent.textContent) {
      // console.log("Article content could not be parsed or is empty.");
      return { ...article, content: '', favicon};
    }

    const hasVerifyMessage = verifyMessages.find(w => articleContent.textContent.toLowerCase().includes(w));
    if (hasVerifyMessage) {
      // console.log("Article requires human verification.");
      return { ...article, content: '', favicon};
    }

    const cleanedText = cleanText(articleContent.textContent, filterWords);
    
    if (cleanedText.split(' ').length < 100) { // Example threshold: 100 words
      // console.log("Article content is too short and likely not valuable.");
      return { ...article, content: '', favicon };
    }

    // console.log("SUCCESSFULLY SCRAPED ARTICLE CONTENT:", cleanedText);
    return { ...article, content: cleanedText, favicon};
  } catch (error) {
    // console.error('Error extracting article with Puppeteer:', error);
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