require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');
const connectDB = require('./db/config');

async function testArticleSaving() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const testArticles = [
    {
        title: 'AI Breakthrough: New Model Surpasses Human Performance',
        link: `https://example.com/ai-breakthrough-article-${Date.now()}`, // Make link unique
        source: 'Tech News Daily',
        image: 'https://example.com/article-image.jpg',
        publishedAt: new Date('2024-05-13T08:30:00Z'),
        articleType: 'news',
        searchTerm: 'AI developments',
        category: 'Technology',
        tags: ['AI', 'Machine Learning', 'Research'],
        used: false
      }
    ];

    // Save articles
    const savedArticles = await Article.create(testArticles);
    console.log(`✅ Successfully saved ${savedArticles.length} test articles`);

    // Verify articles were saved
    const foundArticles = await Article.find({ searchTerm: 'AI developments' });
    console.log('\nRetrieved articles:');
    foundArticles.forEach(article => {
      console.log({
        title: article.title,
        link: article.link,
        publishedAt: article.publishedAt,
        createdAt: article.createdAt
      });
    });

    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testArticleSaving();