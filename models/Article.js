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
  source: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  publishedAt: {
    type: Date,
    required: true
  },
  articleType: {
    type: String,
    default: 'news'
  },
  searchTerm: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  used: {
    type: Boolean,
    default: false
  },
    usedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Article', articleSchema);