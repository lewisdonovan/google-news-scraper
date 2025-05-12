const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  image: String,
  source: String,
  datetime: Date,
  time: String,
  articleType: String,
  searchTerm: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Article', articleSchema);