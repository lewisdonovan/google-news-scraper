require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db/config');

async function testCollection() {
  try {
    await connectDB();
    
    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Available collections:', collectionNames);
    
    // Check if articles collection exists
    const hasArticles = collectionNames.includes('articles');
    console.log('\nArticles collection exists:', hasArticles);
    
    // Get count of documents if collection exists
    if (hasArticles) {
      const count = await mongoose.connection.db.collection('articles').countDocuments();
      console.log('Number of documents in articles collection:', count);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testCollection();