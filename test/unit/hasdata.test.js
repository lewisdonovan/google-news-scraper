import expect from 'expect.js'
import { buildParams, toArticles, toLanguage } from '../../dist/tsc/providers/hasdata.js'
import { searchResponse } from '../fixtures/hasdata.js'

const config = (overrides = {}) => ({
  timeframe: '7d',
  queryVars: {},
  third_party: { source: 'hasdata', apikey: 'KEY' },
  ...overrides,
})

describe('hasdata buildParams', () => {
  it('maps the search term and timeframe to q and keeps the api key out of the query', () => {
    expect(buildParams(config({ searchTerm: 'tesla' }))).to.eql({ q: 'tesla when:7d' })
  })

  it('maps topic and section urls to tokens', () => {
    const params = buildParams(config({ baseUrl: 'https://news.google.com/topics/TOPIC/sections/SECTION?hl=en-US' }))
    expect(params.topicToken).to.equal('TOPIC')
    expect(params.sectionToken).to.equal('SECTION')
    expect(params.q).to.be(undefined)
  })

  it('maps publication and story urls to tokens', () => {
    expect(buildParams(config({ baseUrl: 'https://news.google.com/publications/PUB' })).publicationToken).to.equal('PUB')
    expect(buildParams(config({ baseUrl: 'https://news.google.com/stories/STORY' })).storyToken).to.equal('STORY')
  })

  it('sends hl as a language HasData accepts, gl in lowercase, and drops other query vars', () => {
    const params = buildParams(config({ searchTerm: 'x', queryVars: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' } }))
    expect(params.hl).to.equal('en')
    expect(params.gl).to.equal('gb')
    expect(params.ceid).to.be(undefined)
  })

  it('keeps the regional languages HasData supports', () => {
    expect(toLanguage('zh-TW')).to.equal('zh-tw')
    expect(toLanguage('pt-BR')).to.equal('pt-br')
    expect(toLanguage('fr')).to.equal('fr')
    expect(toLanguage('es-419')).to.equal('es')
  })

  it('lets third_party.config win over the top-level config', () => {
    const params = buildParams(config({
      searchTerm: 'tesla',
      queryVars: { gl: 'US' },
      third_party: { source: 'hasdata', apikey: 'KEY', config: { q: 'tesla site:reuters.com', gl: 'gb', so: 1 } },
    }))
    expect(params.q).to.equal('tesla site:reuters.com')
    expect(params.gl).to.equal('gb')
    expect(params.so).to.equal('1')
  })
})

describe('hasdata toArticles', () => {
  const now = new Date('2026-10-09T18:10:13Z')
  const articles = toArticles(searchResponse, now)

  it('maps results into the usual article shape', () => {
    expect(articles[0]).to.eql({
      title: 'Tesla deliveries beat estimates',
      link: 'https://www.reuters.com/business/autos/tesla-deliveries',
      image: 'https://www.reuters.com/thumb.jpg?auth=abc&width=1080',
      source: 'Reuters',
      sourceUrl: 'https://www.reuters.com',
      datetime: '2026-10-09T17:10:13.000Z',
      time: '1 hour ago',
      articleType: 'regular',
      favicon: 'https://www.reuters.com/favicon.ico',
      rawResult: searchResponse.newsResults[0],
    })
  })

  it('flattens story clusters and drops untitled stories', () => {
    expect(articles.map(a => a.title)).to.eql([
      'Tesla deliveries beat estimates',
      'Analysts react',
      'A story without a date',
    ])
    expect(articles[1].rawResult).to.be(searchResponse.newsResults[1].stories[0])
  })

  it('leaves missing dates and thumbnails empty', () => {
    expect(articles[2].datetime).to.equal('')
    expect(articles[2].time).to.equal('')
    expect(articles[2].image).to.equal('')
    expect(articles[2].favicon).to.be(undefined)
  })

  it('handles a response without results', () => {
    expect(toArticles({})).to.eql([])
  })
})
