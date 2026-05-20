import expect from 'expect.js'
import getTitle from '../../getTitle.js'
import * as cheerio from 'cheerio'

describe('getTitle', () => {
  describe('regular articles', () => {
    it('extracts text from h4 element', () => {
      const $ = cheerio.load('<article><h4>Article Title</h4></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal('Article Title')
    })

    it('returns empty string when h4 is empty', () => {
      const $ = cheerio.load('<article><h4></h4></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal('')
    })

    it('falls back to nested div link text', () => {
      const $ = cheerio.load('<article><div><div><div><span>top1</span></div></div><div><div><a>Alternative Title</a></div></div></div></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal('Alternative Title')
    })

    it('prioritizes h4 over nested div link', () => {
      const $ = cheerio.load('<article><h4>Main Title</h4><div><div><div><a>Alt Title</a></div></div></div></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal('Main Title')
    })
  })

  describe('topicFeatured articles', () => {
    it('extracts title from anchor with target=_blank', () => {
      const $ = cheerio.load('<article><figure><a target="_blank">Topic Title</a></figure></article>')
      const result = getTitle($('article'), 'topicFeatured')
      expect(result).to.equal('Topic Title')
    })

    it('extracts title from button aria-label', () => {
      const $ = cheerio.load('<article><button aria-label="More - Button Title">More</button></article>')
      const result = getTitle($('article'), 'topicFeatured')
      expect(result).to.equal('Button Title')
    })

    it('strips "More - " prefix from button aria-label', () => {
      const $ = cheerio.load('<article><button aria-label="More - Featured Topic">More</button></article>')
      const result = getTitle($('article'), 'topicFeatured')
      expect(result).to.equal('Featured Topic')
    })

    it('returns empty string when no anchor or button found', () => {
      const $ = cheerio.load('<article><figure><img src="img.jpg"/></figure></article>')
      const result = getTitle($('article'), 'topicFeatured')
      expect(result).to.equal('')
    })
  })

  describe('topicSmall articles', () => {
    it('extracts title from anchor with target=_blank', () => {
      const $ = cheerio.load('<article><a target="_blank">Small Topic</a></article>')
      const result = getTitle($('article'), 'topicSmall')
      expect(result).to.equal('Small Topic')
    })

    it('extracts title from button aria-label', () => {
      const $ = cheerio.load('<article><button aria-label="More - Topic Link">More</button></article>')
      const result = getTitle($('article'), 'topicSmall')
      expect(result).to.equal('Topic Link')
    })

    it('returns empty string for unknown type', () => {
      const $ = cheerio.load('<article>Unknown content</article>')
      const result = getTitle($('article'), 'unknown')
      expect(result).to.equal('')
    })
  })

  describe('edge cases', () => {
    it('trims title whitespace', () => {
      const $ = cheerio.load('<article><h4>  Title with spaces  </h4></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal('Title with spaces')
    })

    it('handles title with special characters', () => {
      const $ = cheerio.load('<article><h4>Bitcoin & Ethereum: What\'s Next?</h4></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal("Bitcoin & Ethereum: What's Next?")
    })

    it('returns empty string for title with only whitespace', () => {
      const $ = cheerio.load('<article><h4>   </h4></article>')
      const result = getTitle($('article'), 'regular')
      expect(result).to.equal('')
    })
  })
})
