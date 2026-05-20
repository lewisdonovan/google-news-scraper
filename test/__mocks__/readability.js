class Readability {
  constructor(doc) {
    this.doc = doc
  }
  parse() {
    return {
      title: 'Test Article',
      excerpt: 'Test excerpt',
      content: '<p>Test content</p>',
      textContent: 'Test content',
      length: 13,
      atTop: false,
    }
  }
}

module.exports = { Readability }
