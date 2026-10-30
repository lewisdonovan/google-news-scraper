import expect from 'expect.js'
import getArticleContent from '../../dist/tsc/getArticleContent.js'

const logger = { info() {}, warn() {}, error() {} }

const html = `<html lang="en"><head>
  <meta name="description" content="Summary">
  <meta name="author" content="Jane Doe">
  <meta property="og:image" content="https://example.com/lead.jpg">
  <link rel="canonical" href="https://example.com/story">
</head><body></body></html>`

const browserFor = ({ fail = false } = {}) => ({
  newPage: async () => ({
    goto: async () => { if (fail) throw new Error('timeout') },
    evaluate: async (fn) => fn.toString().includes('innerHTML') ? html : '/favicon.ico',
    url: () => 'https://example.com/story?ref=gn',
    close: async () => {},
  }),
})

const article = { title: 'Story', link: 'https://example.com/story?ref=gn', image: '', authors: [] }

describe('getArticleContent', () => {
  it('adds page metadata and says why content is missing', async () => {
    // The Readability mock returns too little text to keep
    const [result] = await getArticleContent({ articles: [article], browser: browserFor(), filterWords: [], logger })
    expect(result.contentStatus).to.equal('too_short')
    expect(result.content).to.equal('')
    expect(result.wordCount).to.equal(0)
    expect(result.authors).to.eql(['Jane Doe'])
    expect(result.language).to.equal('en')
    expect(result.excerpt).to.equal('Summary')
    expect(result.canonicalUrl).to.equal('https://example.com/story')
    expect(result.image).to.equal('https://example.com/lead.jpg')
    expect(result.favicon).to.equal('/favicon.ico')
  })

  it('keeps an image and authors the article already had', async () => {
    const [result] = await getArticleContent({
      articles: [{ ...article, image: 'https://cdn.example.com/thumb.jpg', authors: ['Feed Author'] }],
      browser: browserFor(), filterWords: [], logger,
    })
    expect(result.image).to.equal('https://cdn.example.com/thumb.jpg')
    expect(result.authors).to.eql(['Feed Author'])
  })

  it('marks failed page loads as errors', async () => {
    const [result] = await getArticleContent({ articles: [article], browser: browserFor({ fail: true }), filterWords: [], logger })
    expect(result.contentStatus).to.equal('error')
    expect(result.content).to.equal('')
    expect(result.favicon).to.equal('')
  })
})
