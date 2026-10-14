import expect from 'expect.js'
import getPrettyUrl, { getArticleId, decodeLegacyId } from '../../dist/tsc/getPrettyUrl.js'
import { articlePage, batchResponse } from '../fixtures/feed.js'

const logger = { info: () => {}, error: () => {}, warn: () => {}, debug: () => {} }

describe('getArticleId', () => {
  it('reads ids from rss, articles and read links', () => {
    expect(getArticleId('https://news.google.com/rss/articles/CBMiABC?oc=5')).to.equal('CBMiABC')
    expect(getArticleId('https://news.google.com/articles/CBMiABC')).to.equal('CBMiABC')
    expect(getArticleId('https://news.google.com/read/CBMiABC?hl=en')).to.equal('CBMiABC')
  })

  it('returns null for other urls', () => {
    expect(getArticleId('https://example.com/story')).to.be(null)
    expect(getArticleId('')).to.be(null)
  })
})

describe('decodeLegacyId', () => {
  it('decodes ids that embed the url', () => {
    const id = Buffer.from('\x08\x13"\x1bhttps://example.com/article\xd2\x01').toString('base64url')
    expect(decodeLegacyId(id)).to.equal('https://example.com/article')
  })

  it('returns null for opaque ids', () => {
    expect(decodeLegacyId(Buffer.from('\x08\x13"AU_yqLabc').toString('base64url'))).to.be(null)
  })
})

describe('getPrettyUrl', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('resolves opaque ids through Google', async () => {
    const calls = []
    global.fetch = jest.fn(async (url, options) => {
      calls.push({ url, options })
      const body = url.includes('batchexecute')
        ? batchResponse('https://www.reuters.com/story')
        : articlePage('SIG', '1791993031')
      return { ok: true, text: async () => body }
    })
    const result = await getPrettyUrl('https://news.google.com/rss/articles/CBMiAU_yqLOne?oc=5', logger)
    expect(result).to.equal('https://www.reuters.com/story')
    expect(calls[0].url).to.equal('https://news.google.com/rss/articles/CBMiAU_yqLOne')
    expect(decodeURIComponent(calls[1].options.body)).to.contain('SIG')
  })

  it('returns null when the signature is missing', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, text: async () => '<html></html>' }))
    expect(await getPrettyUrl('https://news.google.com/rss/articles/CBMiAU_yqLOne', logger)).to.be(null)
  })

  it('returns null when the request fails', async () => {
    global.fetch = jest.fn(async () => { throw new Error('network down') })
    expect(await getPrettyUrl('https://news.google.com/rss/articles/CBMiAU_yqLOne', logger)).to.be(null)
  })

  it('returns null for non-Google links', async () => {
    expect(await getPrettyUrl('https://example.com', logger)).to.be(null)
  })
})
