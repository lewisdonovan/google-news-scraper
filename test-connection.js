require('dotenv').config();
const connectDB = require('./db/config');

async function testConnection() {
  try {
    await connectDB();
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('Connection string:', process.env.MONGODB_URI);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();