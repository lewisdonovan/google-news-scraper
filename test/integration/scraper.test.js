import expect from 'expect.js'
import { feedXml, articlePage, batchResponse } from '../fixtures/feed.js'
import { searchResponse, emptyResponse, errorResponse } from '../fixtures/serpapi.js'

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn(async () => ({ newPage: jest.fn(), close: jest.fn() })) },
}))

const gns = require('../../dist/tsc/index.js').default

const respond = (body, ok = true, status = 200) => ({ ok, status, text: async () => body })

const mockGoogle = ({ feed = feedXml, feedOk = true, serp = searchResponse, serpStatus = 200 } = {}) => {
  global.fetch = jest.fn(async (url) => {
    if (url.startsWith('https://serpapi.com/')) return respond(JSON.stringify(serp), serpStatus < 400, serpStatus)
    if (url.includes('batchexecute')) return respond(batchResponse('https://publisher.example/story'))
    if (url.includes('/rss/articles/')) return respond(articlePage('SIG', '1791993031'))
    return respond(feed, feedOk, feedOk ? 200 : 404)
  })
}

describe('googleNewsScraper', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('returns articles with publisher urls by default', async () => {
    mockGoogle()
    const articles = await gns({ searchTerm: 'tesla', logLevel: 'none' })
    expect(articles).to.have.length(2)
    expect(articles[0].title).to.equal("Tesla's China-made EV sales quicken in September")
    expect(articles[0].source).to.equal('Reuters')
    expect(articles[0].link).to.equal('https://publisher.example/story')
    expect(articles[0].provider).to.equal('scraper')
    expect(new Date(articles[0].datetime).getTime()).to.be.greaterThan(0)
  })

  it('adds position, id, domain, query and retrievedAt to every article', async () => {
    mockGoogle()
    const before = Date.now()
    const articles = await gns({ searchTerm: 'tesla', logLevel: 'none' })
    expect(articles.map(a => a.position)).to.eql([1, 2])
    expect(articles[0].id).to.match(/^[0-9a-f]{16}$/)
    expect(articles[0].domain).to.equal('reuters.com')
    expect(articles[1].domain).to.equal('cnbc.com')
    expect(articles[0].authors).to.eql([])
    expect(articles[0].query).to.equal('tesla')
    expect(new Date(articles[0].retrievedAt).getTime()).to.not.be.below(before)
    expect(articles[1].retrievedAt).to.equal(articles[0].retrievedAt)
  })

  it('uses the page url as the query for topics and top stories', async () => {
    mockGoogle()
    const baseUrl = 'https://news.google.com/topics/ABC'
    expect((await gns({ baseUrl, prettyURLs: false, logLevel: 'none' }))[0].query).to.equal(baseUrl)
    expect((await gns({ prettyURLs: false, logLevel: 'none' }))[0].query).to.equal('https://news.google.com/')
  })

  it('keeps Google links when prettyURLs is false', async () => {
    mockGoogle()
    const articles = await gns({ searchTerm: 'tesla', prettyURLs: false, logLevel: 'none' })
    expect(articles[0].link).to.contain('news.google.com')
    expect(global.fetch.mock.calls).to.have.length(1)
  })

  it('requests the search feed', async () => {
    mockGoogle()
    await gns({ searchTerm: 'tesla', timeframe: '1d', prettyURLs: false, logLevel: 'none' })
    const url = new URL(global.fetch.mock.calls[0][0])
    expect(url.pathname).to.equal('/rss/search')
    expect(url.searchParams.get('q')).to.equal('tesla when:1d')
  })

  it('applies the limit before resolving urls', async () => {
    mockGoogle()
    const articles = await gns({ searchTerm: 'tesla', limit: 1, logLevel: 'none' })
    expect(articles).to.have.length(1)
    expect(global.fetch.mock.calls.filter(([url]) => url.includes('batchexecute'))).to.have.length(1)
  })

  it('returns nothing for a limit of 0', async () => {
    mockGoogle()
    expect(await gns({ searchTerm: 'tesla', limit: 0, logLevel: 'none' })).to.have.length(0)
  })

  it('returns an empty array when Google errors', async () => {
    mockGoogle({ feedOk: false })
    expect(await gns({ searchTerm: 'tesla', logLevel: 'none' })).to.have.length(0)
  })

  it('returns an empty array when the request throws', async () => {
    global.fetch = jest.fn(async () => { throw new Error('offline') })
    expect(await gns({ searchTerm: 'tesla', logLevel: 'none' })).to.have.length(0)
  })

  it('does not launch a browser unless article content is requested', async () => {
    mockGoogle()
    const puppeteer = require('puppeteer').default
    puppeteer.launch.mockClear()
    await gns({ searchTerm: 'tesla', prettyURLs: false, logLevel: 'none' })
    expect(puppeteer.launch.mock.calls).to.have.length(0)
  })

  describe('with a third-party provider', () => {
    const third_party = { source: 'serpapi', apikey: 'KEY' }
    const calledProvider = () => global.fetch.mock.calls.some(([url]) => url.startsWith('https://serpapi.com/'))
    const calledGoogle = () => global.fetch.mock.calls.some(([url]) => url.includes('news.google.com'))

    it('uses the provider as primary by default and skips the scraper', async () => {
      mockGoogle()
      const articles = await gns({ searchTerm: 'tesla', third_party, logLevel: 'none' })
      expect(articles).to.have.length(4)
      expect(articles[0].source).to.equal('Reuters')
      expect(articles[0].rawResult).to.eql(searchResponse.news_results[0])
      expect(articles[0].provider).to.equal('serpapi')
      expect(articles.map(a => a.position)).to.eql([1, 2, 3, 4])
      expect(articles[0].domain).to.equal('reuters.com')
      expect(articles[0].authors).to.eql(['Jane Doe'])
      expect(calledGoogle()).to.be(false)
      const url = new URL(global.fetch.mock.calls[0][0])
      expect(url.searchParams.get('api_key')).to.equal('KEY')
      expect(url.searchParams.get('q')).to.equal('tesla when:7d')
    })

    it('applies the limit to provider results', async () => {
      mockGoogle()
      expect(await gns({ searchTerm: 'tesla', limit: 2, third_party, logLevel: 'none' })).to.have.length(2)
    })

    it('falls back to the scraper when the primary provider fails', async () => {
      mockGoogle({ serp: errorResponse, serpStatus: 401 })
      const articles = await gns({ searchTerm: 'tesla', prettyURLs: false, third_party, logLevel: 'none' })
      expect(articles).to.have.length(2)
      expect(articles[0].rawResult).to.be(undefined)
      expect(articles[0].provider).to.equal('scraper')
      expect(calledGoogle()).to.be(true)
    })

    it('treats an empty provider search as a result, not a failure', async () => {
      mockGoogle({ serp: emptyResponse })
      expect(await gns({ searchTerm: 'tesla', third_party, logLevel: 'none' })).to.have.length(0)
      expect(calledGoogle()).to.be(false)
    })

    it('only calls the provider when the scraper fails if primary is false', async () => {
      mockGoogle()
      await gns({ searchTerm: 'tesla', prettyURLs: false, third_party: { ...third_party, primary: false }, logLevel: 'none' })
      expect(calledProvider()).to.be(false)

      mockGoogle({ feedOk: false })
      const articles = await gns({ searchTerm: 'tesla', third_party: { ...third_party, primary: false }, logLevel: 'none' })
      expect(articles).to.have.length(4)
      expect(articles[0].provider).to.equal('serpapi')
      expect(calledProvider()).to.be(true)
    })

    it('returns an empty array when both fail', async () => {
      mockGoogle({ feedOk: false, serp: errorResponse, serpStatus: 401 })
      expect(await gns({ searchTerm: 'tesla', third_party, logLevel: 'none' })).to.have.length(0)
    })

    it('ignores the provider without an api key', async () => {
      mockGoogle()
      await gns({ searchTerm: 'tesla', prettyURLs: false, third_party: { source: 'serpapi' }, logLevel: 'none' })
      expect(calledProvider()).to.be(false)
    })

    it('rejects an unknown source', async () => {
      mockGoogle()
      let error
      try { await gns({ searchTerm: 'tesla', third_party: { source: 'nope', apikey: 'KEY' }, logLevel: 'none' }) } catch (e) { error = e }
      expect(error.message).to.contain('Unsupported third_party source')
    })
  })
})
