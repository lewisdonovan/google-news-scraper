import expect from 'expect.js'
import { buildRequest, toArticles } from '../../dist/tsc/providers/serpbase.js'
import { searchResponse } from '../fixtures/serpbase.js'

const config = (overrides = {}) => ({
  timeframe: '7d',
  queryVars: {},
  third_party: { source: 'serpbase', apikey: 'KEY' },
  ...overrides,
})

describe('serpbase buildRequest', () => {
  it('sends the search term as q', () => {
    expect(buildRequest(config({ searchTerm: 'tesla' }))).to.eql({ q: 'tesla' })
  })

  it('lowercases hl and gl and drops the other query vars', () => {
    const body = buildRequest(config({ searchTerm: 'tesla', queryVars: { hl: 'en-GB', gl: 'GB', ceid: 'GB:en' } }))
    expect(body).to.eql({ q: 'tesla', hl: 'en-gb', gl: 'gb' })
  })

  it('does not fold the timeframe into the query', () => {
    const body = buildRequest(config({ searchTerm: 'tesla', timeframe: '1d' }))
    expect(body.q).to.equal('tesla')
  })

  it('lets third_party.config win over the top-level config', () => {
    const body = buildRequest(config({
      searchTerm: 'tesla',
      queryVars: { gl: 'US' },
      third_party: { source: 'serpbase', apikey: 'KEY', config: { q: 'tesla site:reuters.com', gl: 'gb', page: 2 } },
    }))
    expect(body.q).to.equal('tesla site:reuters.com')
    expect(body.gl).to.equal('gb')
    expect(body.page).to.equal(2)
  })

  it('never puts the api key in the request body', () => {
    expect(buildRequest(config({ searchTerm: 'tesla' })).api_key).to.be(undefined)
  })
})

describe('serpbase toArticles', () => {
  const articles = toArticles(searchResponse)

  it('maps results into the usual article shape', () => {
    expect(articles[0]).to.eql({
      title: 'Tesla deliveries beat estimates',
      link: 'https://www.reuters.com/business/autos/tesla-deliveries',
      image: '',
      source: 'Reuters',
      sourceUrl: 'https://www.reuters.com',
      datetime: '',
      time: '1 hour ago',
      articleType: 'regular',
      rawResult: searchResponse.news[0],
    })
  })

  it('keeps relative ages in time because the api reports no date', () => {
    expect(articles[1].time).to.equal('3 days ago')
    expect(articles[1].datetime).to.equal('')
  })

  it('keeps http thumbnails and drops base64 ones', () => {
    expect(articles[0].image).to.equal('')
    expect(articles[1].image).to.equal('https://cdn.theverge.com/tesla-model.jpg')
  })

  it('drops site navigation and untitled results', () => {
    expect(articles.map(a => a.title)).to.eql(['Tesla deliveries beat estimates', 'Musk unveils new model'])
  })

  it('handles a response without results', () => {
    expect(toArticles({})).to.eql([])
    expect(toArticles({ news: [] })).to.eql([])
  })
})
