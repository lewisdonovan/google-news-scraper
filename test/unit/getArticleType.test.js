import expect from 'expect.js'
import getArticleType from '../../getArticleType.js'
import * as cheerio from 'cheerio'

describe('getArticleType', () => {
  it('returns "regular" when h4 element is present', () => {
    const $ = cheerio.load('<article><h4>Article Title</h4></article>')
    const result = getArticleType($('article'))
    expect(result).to.equal('regular')
  })

  it('returns "topicFeatured" when figure element is present but no h4', () => {
    const $ = cheerio.load('<article><figure><a><img src="img.jpg"/></a></figure></article>')
    const result = getArticleType($('article'))
    expect(result).to.equal('topicFeatured')
  })

  it('returns "topicSmall" when direct child a has text but no h4 or figure', () => {
    const $ = cheerio.load('<article><a href="/topic">Topic Title</a></article>')
    const result = getArticleType($('article'))
    expect(result).to.equal('topicSmall')
  })

  it('returns empty string for article with no matching elements', () => {
    const $ = cheerio.load('<article><p>No matching elements here</p></article>')
    const result = getArticleType($('article'))
    expect(result).to.equal('')
  })

  it('returns empty string for empty article', () => {
    const $ = cheerio.load('<article></article>')
    const result = getArticleType($('article'))
    expect(result).to.equal('')
  })

  it('prioritizes regular over topicFeatured when both present', () => {
    const $ = cheerio.load('<article><h4>Title</h4><figure><a>Fig</a></figure></article>')
    const result = getArticleType($('article'))
    expect(result).to.equal('regular')
  })
})
