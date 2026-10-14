import expect from 'expect.js'
import parseFeed, { timeAgo } from '../../dist/tsc/parseFeed.js'
import { feedXml } from '../fixtures/feed.js'

describe('parseFeed', () => {
  const now = new Date('2026-10-09T18:10:13Z')
  const articles = parseFeed(feedXml, now)

  it('returns one article per item', () => {
    expect(articles).to.have.length(3)
  })

  it('strips the source suffix from titles', () => {
    expect(articles[0].title).to.equal("Tesla's China-made EV sales quicken in September")
    expect(articles[0].source).to.equal('Reuters')
    expect(articles[0].sourceUrl).to.equal('https://www.reuters.com')
  })

  it('keeps the Google News link', () => {
    expect(articles[0].link).to.equal('https://news.google.com/rss/articles/CBMiAU_yqLOne?oc=5')
  })

  it('converts pubDate to ISO and relative time', () => {
    expect(articles[1].datetime).to.equal('2026-10-09T17:10:13.000Z')
    expect(articles[1].time).to.equal('1 hour ago')
  })

  it('leaves empty titles empty', () => {
    expect(articles[2].title).to.equal('')
  })

  it('returns no articles for an empty feed', () => {
    expect(parseFeed('<rss><channel></channel></rss>')).to.have.length(0)
  })
})

describe('timeAgo', () => {
  const now = new Date('2026-10-14T12:00:00Z')
  it('formats minutes, hours and days', () => {
    expect(timeAgo(new Date('2026-10-14T11:55:00Z'), now)).to.equal('5 minutes ago')
    expect(timeAgo(new Date('2026-10-14T09:00:00Z'), now)).to.equal('3 hours ago')
    expect(timeAgo(new Date('2026-10-13T12:00:00Z'), now)).to.equal('yesterday')
  })
})
