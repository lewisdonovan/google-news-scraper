import expect from 'expect.js'
import { getPageMetadata } from '../../dist/tsc/pageMetadata.js'

const page = (head, lang = 'en-GB') => `<html lang="${lang}"><head>${head}</head><body><p>Body</p></body></html>`
const url = 'https://www.example.com/news/story?utm=1'

describe('getPageMetadata', () => {
  it('reads Open Graph and article meta tags', () => {
    const metadata = getPageMetadata(page(`
      <meta name="description" content="A short summary.">
      <meta name="author" content="Jane Doe">
      <meta property="article:published_time" content="2026-10-09T10:00:00+01:00">
      <meta property="article:modified_time" content="2026-10-09T12:30:00Z">
      <meta property="article:section" content="Business">
      <meta property="article:tag" content="Tesla">
      <meta property="article:tag" content="EVs">
      <meta property="og:image" content="/images/lead.jpg">
      <link rel="canonical" href="https://www.example.com/news/story">
    `), url)
    expect(metadata).to.eql({
      authors: ['Jane Doe'],
      language: 'en-GB',
      excerpt: 'A short summary.',
      canonicalUrl: 'https://www.example.com/news/story',
      publishedAt: '2026-10-09T09:00:00.000Z',
      modifiedAt: '2026-10-09T12:30:00.000Z',
      keywords: ['Tesla', 'EVs'],
      section: 'Business',
      image: 'https://www.example.com/images/lead.jpg',
    })
  })

  it('prefers JSON-LD, including inside @graph', () => {
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: 'Ignore me' },
        {
          '@type': ['NewsArticle'],
          author: [{ '@type': 'Person', name: 'Jane Doe' }, { name: 'John Roe' }, 'https://example.com/staff/x'],
          datePublished: '2026-10-09T09:00:00Z',
          keywords: 'Tesla, Musk',
          articleSection: ['Autos'],
          image: { url: 'https://cdn.example.com/a.jpg' },
        },
      ],
    }
    const metadata = getPageMetadata(page(`
      <meta name="author" content="Someone Else">
      <meta name="keywords" content="ignored">
      <script type="application/ld+json">${JSON.stringify(ld)}</script>
    `), url)
    expect(metadata.authors).to.eql(['Jane Doe', 'John Roe'])
    expect(metadata.publishedAt).to.equal('2026-10-09T09:00:00.000Z')
    expect(metadata.keywords).to.eql(['Tesla', 'Musk'])
    expect(metadata.section).to.equal('Autos')
    expect(metadata.image).to.equal('https://cdn.example.com/a.jpg')
  })

  it('skips broken JSON-LD and falls back to the page url', () => {
    const metadata = getPageMetadata(page('<script type="application/ld+json">{nope</script>', ''), url)
    expect(metadata).to.eql({
      authors: [],
      language: '',
      excerpt: '',
      canonicalUrl: url,
      publishedAt: '',
      modifiedAt: '',
      keywords: [],
      section: '',
      image: '',
    })
  })
})
