import expect from 'expect.js'
import buildQueryString from '../../buildQueryString.js'

describe('buildQueryString', () => {
  it('returns empty string for empty object', () => {
    expect(buildQueryString({})).to.equal('')
  })

  it('returns empty string for null', () => {
    expect(buildQueryString(null)).to.equal('')
  })

  it('returns empty string for undefined', () => {
    expect(buildQueryString(undefined)).to.equal('')
  })

  it('builds query string with single key-value', () => {
    const result = buildQueryString({ q: 'bitcoin' })
    expect(result).to.equal('?q=bitcoin')
  })

  it('builds query string with multiple keys', () => {
    const result = buildQueryString({ q: 'bitcoin', gl: 'US', hl: 'en' })
    expect(result).to.equal('?q=bitcoin&gl=US&hl=en')
  })

  it('uses & separator for additional keys after first', () => {
    const result = buildQueryString({ a: '1', b: '2', c: '3' })
    expect(result).to.equal('?a=1&b=2&c=3')
  })

  it('handles values with no special characters', () => {
    const result = buildQueryString({ ceid: 'US:en' })
    expect(result).to.equal('?ceid=US:en')
  })

  it('handles empty string values', () => {
    const result = buildQueryString({ q: '' })
    expect(result).to.equal('?q=')
  })

  it('handles values with numbers', () => {
    const result = buildQueryString({ when: '7d' })
    expect(result).to.equal('?when=7d')
  })
})
