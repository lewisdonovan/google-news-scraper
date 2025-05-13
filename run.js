const mongoose = require('mongoose');
const googleNewsScraper = require('./index.js');
const Article = require('./models/Article');
const connectDB = require('./db/config');

async function run() {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('Connected to MongoDB');

    // Get count before scraping
    const beforeCount = await Article.countDocuments({ searchTerm: "ai agents" });
    console.log(`Existing articles for "ai agents": ${beforeCount}`);

    const articles = await googleNewsScraper({
      searchTerm: "ai agents",
      prettyURLs: false,  // Use original Google News URLs
      puppeteerHeadlessMode: true,
      timeframe: "7d",
      logLevel: "info",
      limit: 5
    });
    
    // Debug: Look at the first article
    console.log('\nFirst scraped article:');
    console.log(JSON.stringify(articles[0], null, 2));

    // Try manual save to see any validation errors
    try {
      // Log first article before saving to check its structure
      console.log('\nTrying to save article with structure:', {
        title: articles[0].title,
        link: articles[0].link,
        source: articles[0].source,
        publishedAt: articles[0].datetime,
        articleType: articles[0].articleType,
        searchTerm: articles[0].searchTerm
      });

      const savedArticles = await Article.insertMany(articles.map(article => ({
        title: article.title,
        link: article.link,
        source: article.source,
        publishedAt: article.datetime,
        articleType: article.articleType,
        searchTerm: article.searchTerm,
        image: article.image,
        category: '',
        tags: [],
        used: false
      })), { 
        ordered: false,
        validate: true
      });
      console.log(`\nManually saved ${savedArticles.length} articles`);
    } catch (error) {
      console.error('\nError saving articles:', error.message);
      if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
    }
    
    // Get count after scraping
    const afterCount = await Article.countDocuments({ searchTerm: "ai agents" });
    
    console.log(`\nArticles scraped: ${articles.length}`);
    console.log(`Articles in DB before: ${beforeCount}`);
    console.log(`Articles in DB after: ${afterCount}`);
    console.log(`New articles saved: ${afterCount - beforeCount}`);

    // Close database connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    // Ensure DB connection is closed even if there's an error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

run();