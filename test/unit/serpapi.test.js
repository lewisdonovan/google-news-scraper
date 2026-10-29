import expect from 'expect.js'
import { buildParams, toArticles } from '../../dist/tsc/providers/serpapi.js'
import { searchResponse } from '../fixtures/serpapi.js'

const config = (overrides = {}) => ({
  timeframe: '7d',
  queryVars: {},
  third_party: { source: 'serpapi', apikey: 'KEY' },
  ...overrides,
})

describe('serpapi buildParams', () => {
  it('maps the search term and timeframe to q', () => {
    const params = buildParams(config({ searchTerm: 'tesla' }))
    expect(params).to.eql({ engine: 'google_news', q: 'tesla when:7d', api_key: 'KEY' })
  })

  it('maps topic and section urls to tokens', () => {
    const params = buildParams(config({ baseUrl: 'https://news.google.com/topics/TOPIC/sections/SECTION?hl=en-US' }))
    expect(params.topic_token).to.equal('TOPIC')
    expect(params.section_token).to.equal('SECTION')
    expect(params.q).to.be(undefined)
  })

  it('maps publication and story urls to tokens', () => {
    expect(buildParams(config({ baseUrl: 'https://news.google.com/publications/PUB' })).publication_token).to.equal('PUB')
    expect(buildParams(config({ baseUrl: 'https://news.google.com/stories/STORY' })).story_token).to.equal('STORY')
  })

  it('passes hl and gl through in lowercase and drops other query vars', () => {
    const params = buildParams(config({ searchTerm: 'x', queryVars: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' } }))
    expect(params.hl).to.equal('en-gb')
    expect(params.gl).to.equal('gb')
    expect(params.ceid).to.be(undefined)
  })

  it('lets third_party.config win over the top-level config', () => {
    const params = buildParams(config({
      searchTerm: 'tesla',
      queryVars: { gl: 'US' },
      third_party: { source: 'serpapi', apikey: 'KEY', config: { q: 'tesla site:reuters.com', gl: 'gb', so: 1 } },
    }))
    expect(params.q).to.equal('tesla site:reuters.com')
    expect(params.gl).to.equal('gb')
    expect(params.so).to.equal('1')
  })
})

describe('serpapi toArticles', () => {
  const now = new Date('2026-10-09T18:10:13Z')
  const articles = toArticles(searchResponse, now)

  it('maps results into the usual article shape', () => {
    expect(articles[0]).to.eql({
      title: 'Tesla deliveries beat estimates',
      link: 'https://www.reuters.com/business/autos/tesla-deliveries',
      image: 'https://www.reuters.com/thumb.jpg',
      source: 'Reuters',
      sourceUrl: 'https://www.reuters.com',
      datetime: '2026-10-09T17:10:13.000Z',
      time: '1 hour ago',
      articleType: 'regular',
      favicon: 'https://www.reuters.com/favicon.ico',
      rawResult: searchResponse.news_results[0],
    })
  })

  it('flattens story clusters and drops untitled stories', () => {
    expect(articles.map(a => a.title)).to.eql([
      'Tesla deliveries beat estimates',
      'Musk unveils new model',
      'Analysts react',
      'A post about Tesla',
    ])
    expect(articles[2].rawResult).to.be(searchResponse.news_results[1].stories[0])
  })

  it('uses the author for social posts and leaves missing dates empty', () => {
    expect(articles[3].source).to.equal('Elon')
    expect(articles[3].datetime).to.equal('')
    expect(articles[3].image).to.equal('')
  })

  it('handles a response without results', () => {
    expect(toArticles({})).to.eql([])
  })
})
