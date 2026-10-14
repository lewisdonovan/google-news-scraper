import expect from 'expect.js'
import { feedXml, articlePage, batchResponse } from '../fixtures/feed.js'

jest.mock('puppeteer', () => ({
  __esModule: true,
  default: { launch: jest.fn(async () => ({ newPage: jest.fn(), close: jest.fn() })) },
}))

const gns = require('../../dist/tsc/index.js').default

const respond = (body, ok = true, status = 200) => ({ ok, status, text: async () => body })

const mockGoogle = ({ feed = feedXml, feedOk = true } = {}) => {
  global.fetch = jest.fn(async (url) => {
    if (url.includes('batchexecute')) return respond(batchResponse('https://publisher.example/story'))
    if (url.includes('/rss/articles/')) return respond(articlePage('SIG', '1791993031'))
    return respond(feed, feedOk, feedOk ? 200 : 503)
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
    expect(new Date(articles[0].datetime).getTime()).to.be.greaterThan(0)
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
})
