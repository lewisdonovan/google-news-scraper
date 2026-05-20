import expect from 'expect.js'
import googleNewsScraper from '../../index.js'

// E2E tests require actual network access and browser.
// Skip by default. Run with E2E=1 npm test -- --testPathPattern="e2e"

describe('googleNewsScraper - e2e', () => {
  it('should scrape front page without searchTerm', async () => {
    const articles = await googleNewsScraper({
      prettyURLs: false,
      timeframe: '1d',
      limit: 3,
      logLevel: 'none',
    })

    expect(articles).to.be.an('array')
    expect(articles.length).to.be.greaterThanOrEqual(1)
    expect(articles[0]).to.haveProperty('title')
    expect(articles[0]).to.haveProperty('link')
    expect(articles[0].title).to.not.be.empty()
  })

  it('should scrape results for a search term', async () => {
    const articles = await googleNewsScraper({
      searchTerm: 'technology',
      prettyURLs: false,
      timeframe: '7d',
      limit: 3,
      logLevel: 'none',
    })

    expect(articles).to.be.an('array')
    expect(articles.length).to.be.greaterThanOrEqual(1)
    expect(articles[0]).to.haveProperty('articleType')
    expect(['regular', 'topicFeatured', 'topicSmall', '']).to.contain(articles[0].articleType)
  })

  it('should return articles with valid ISO datetime', async () => {
    const articles = await googleNewsScraper({
      searchTerm: 'news',
      prettyURLs: false,
      timeframe: '1d',
      limit: 3,
      logLevel: 'none',
    })

    expect(articles.length).to.be.greaterThanOrEqual(1)
    expect(new Date(articles[0].datetime).getTime()).to.be.greaterThan(0)
  })
})
