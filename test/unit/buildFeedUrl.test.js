import expect from 'expect.js'
import buildFeedUrl from '../../dist/tsc/buildFeedUrl.js'

const parse = (config) => new URL(buildFeedUrl({ queryVars: {}, ...config }))

describe('buildFeedUrl', () => {
  it('builds a search feed with the timeframe in the query', () => {
    const url = parse({ searchTerm: 'tesla', timeframe: '7d' })
    expect(url.origin + url.pathname).to.equal('https://news.google.com/rss/search')
    expect(url.searchParams.get('q')).to.equal('tesla when:7d')
  })

  it('defaults to US English', () => {
    const url = parse({ searchTerm: 'tesla' })
    expect(url.searchParams.get('hl')).to.equal('en-US')
    expect(url.searchParams.get('gl')).to.equal('US')
    expect(url.searchParams.get('ceid')).to.equal('US:en')
  })

  it('respects locale queryVars and derives ceid', () => {
    const url = parse({ searchTerm: 'zapatos', queryVars: { hl: 'es', gl: 'ES' } })
    expect(url.searchParams.get('hl')).to.equal('es')
    expect(url.searchParams.get('ceid')).to.equal('ES:es')
  })

  it('converts a topic baseUrl to its feed', () => {
    const url = parse({ baseUrl: 'https://news.google.com/topics/CAAqJgg?hl=en-GB&gl=GB&ceid=GB:en' })
    expect(url.pathname).to.equal('/rss/topics/CAAqJgg')
    expect(url.searchParams.get('gl')).to.equal('GB')
  })

  it('leaves an existing feed url alone', () => {
    const url = parse({ baseUrl: 'https://news.google.com/rss/topics/ABC' })
    expect(url.pathname).to.equal('/rss/topics/ABC')
  })

  it('uses the top stories feed with no search term or baseUrl', () => {
    const url = parse({})
    expect(url.pathname).to.equal('/rss')
  })
})
