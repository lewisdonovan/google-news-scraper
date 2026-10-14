import expect from 'expect.js'
import gnsModule from '../../dist/tsc/index.js'
const googleNewsScraper = gnsModule.default ?? gnsModule

// Hits the real Google News, so it only runs when asked: E2E=1 npx jest test/e2e
const describeLive = process.env.E2E ? describe : describe.skip

describeLive('googleNewsScraper - e2e', () => {
  jest.setTimeout(60000)

  it('scrapes top stories without a searchTerm', async () => {
    const articles = await googleNewsScraper({ prettyURLs: false, limit: 3, logLevel: 'error' })
    expect(articles.length).to.be.greaterThan(0)
    expect(articles[0].title).to.not.be.empty()
    expect(articles[0].link).to.contain('news.google.com')
  })

  it('scrapes results for a search term', async () => {
    const articles = await googleNewsScraper({ searchTerm: 'technology', prettyURLs: false, limit: 3, logLevel: 'error' })
    expect(articles.length).to.be.greaterThan(0)
    expect(articles[0].source).to.not.be.empty()
    expect(new Date(articles[0].datetime).getTime()).to.be.greaterThan(0)
  })

  it('resolves publisher urls', async () => {
    const articles = await googleNewsScraper({ searchTerm: 'news', limit: 2, logLevel: 'error' })
    expect(articles.length).to.be.greaterThan(0)
    expect(articles.some(article => !article.link.includes('news.google.com'))).to.be(true)
  })
})
