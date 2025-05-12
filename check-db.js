const mongoose = require("mongoose");
const Article = require("./models/Article");
const connectDB = require("./db/config");

async function checkArticles() {
  try {
    await connectDB();
    
    // First check what search terms we have
    const distinctTerms = await Article.distinct('searchTerm');
    console.log('Available search terms:', distinctTerms);
    
    // Then get the most recent articles
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`\nFound ${articles.length} most recent articles:`);
    articles.forEach(article => {
      console.log(`\nTitle: ${article.title}`);
      console.log(`Search Term: ${article.searchTerm || 'Not specified'}`);
      console.log(`Source: ${article.source}`);
      console.log(`Created At: ${article.createdAt}`);
      console.log(`Link: ${article.link}`);
      console.log("------------------------");
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    mongoose.connection.close();
  }
}

checkArticles();
