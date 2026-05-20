import expect from 'expect.js'
import getPrettyUrl from '../../getPrettyUrl.js'

const mockLogger = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {}
}

describe('getPrettyUrl', () => {
  it('returns null for URL without /read/ path', () => {
    const result = getPrettyUrl('https://news.google.com/articles/ABC123', mockLogger)
    expect(result).to.be(null)
  })

  it('returns null for empty string', () => {
    const result = getPrettyUrl('', mockLogger)
    expect(result).to.be(null)
  })

  it('decodes a valid base64 /read/ URL', () => {
    const b64 = Buffer.from('https://example.com/article').toString('base64')
    const result = getPrettyUrl(`https://news.google.com/read/${b64}`, mockLogger)
    expect(result).to.equal('https://example.com/article')
  })

  it('returns null for invalid base64', () => {
    const result = getPrettyUrl('https://news.google.com/read/!!!invalid!!!', mockLogger)
    expect(result).to.be(null)
  })

  it('returns null for /read/ with empty base64', () => {
    const result = getPrettyUrl('https://news.google.com/read/', mockLogger)
    expect(result).to.be(null)
  })

  it('extracts the first URL when base64 contains multiple URLs', () => {
    // Simulates Google News encoded payload with URL1 + "R" + URL2
    // The R between URLs gets split by the decode function
    const payload = 'https://first.com/abcRhttps://second.com/xyz'
    const b64 = Buffer.from(payload).toString('base64')
    const result = getPrettyUrl(`https://news.google.com/read/${b64}`, mockLogger)
    // The R in "abcRhttps" is followed by 'h' (alphanumeric), so it does NOT split
    // The full URL is returned
    expect(result).to.equal('https://first.com/abcRhttps://second.com/xyz')
  })

  it('handles base64 with URL path parameters', () => {
    const payload = 'https://example.com/article?id=123&lang=en'
    const b64 = Buffer.from(payload).toString('base64')
    const result = getPrettyUrl(`https://news.google.com/read/${b64}`, mockLogger)
    expect(result).to.equal(payload)
  })
})
