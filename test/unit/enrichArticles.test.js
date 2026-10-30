import expect from 'expect.js'
import enrichArticles, { articleId, domainOf } from '../../dist/tsc/enrichArticles.js'

describe('enrichArticles', () => {
  const context = { query: 'tesla', retrievedAt: '2026-10-30T10:00:00.000Z' }

  it('numbers articles from 1 and keeps existing fields', () => {
    const articles = enrichArticles([
      { title: 'A', link: 'https://www.reuters.com/a', sourceUrl: 'https://www.reuters.com' },
      { title: 'B', link: 'https://cnbc.com/b', authors: ['Jane Doe'] },
    ], context)
    expect(articles[0]).to.eql({
      title: 'A',
      link: 'https://www.reuters.com/a',
      sourceUrl: 'https://www.reuters.com',
      position: 1,
      id: articleId('https://www.reuters.com/a'),
      domain: 'reuters.com',
      authors: [],
      query: 'tesla',
      retrievedAt: '2026-10-30T10:00:00.000Z',
    })
    expect(articles[1].position).to.equal(2)
    expect(articles[1].authors).to.eql(['Jane Doe'])
  })

  it('gives the same link the same id', () => {
    expect(articleId('https://example.com/x')).to.equal(articleId('https://example.com/x'))
    expect(articleId('https://example.com/x')).to.not.equal(articleId('https://example.com/y'))
  })
})

describe('domainOf', () => {
  it('prefers the source url and strips www', () => {
    expect(domainOf({ sourceUrl: 'https://www.bbc.co.uk', link: 'https://news.google.com/rss/articles/X' })).to.equal('bbc.co.uk')
  })

  it('falls back to the link, but not a Google News link', () => {
    expect(domainOf({ sourceUrl: '', link: 'https://x.com/elon/status/1' })).to.equal('x.com')
    expect(domainOf({ sourceUrl: '', link: 'https://news.google.com/rss/articles/X' })).to.equal('')
  })
})
