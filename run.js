const googleNewsScraper = require('./index.js');

async function run() {
  try {
    const articles = await googleNewsScraper({
      searchTerm: "ai agents",
      prettyURLs: true,
      puppeteerHeadlessMode: true,
      timeframe: "7d",
      logLevel: "info",
      limit: 20
    });
    
    console.log(`Successfully scraped ${articles.length} articles`);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();