import expect from 'expect.js'
import { cleanText } from '../../dist/tsc/cleanText.js'

describe('cleanText', () => {
  it('returns empty string for empty input', () => {
    expect(cleanText('', [])).to.equal('')
  })

  it('passes through normal long lines', () => {
    const input = 'This is a normal article line with many words.'
    expect(cleanText(input, [])).to.equal(input)
  })

  it('filters out lines with 4 or fewer words', () => {
    const input = 'Short line\nThis is a line with six words minimum\nTwo words'
    const result = cleanText(input, [])
    expect(result).to.contain('This is a line with six words minimum')
    expect(result).to.not.contain('Short line')
    expect(result).to.not.contain('Two words')
  })

  it('filters out lines with short keyword "subscribe now"', () => {
    const result = cleanText('Subscribe now to our newsletter!\nThis is a legitimate article with many words.', [])
    expect(result).to.not.contain('Subscribe now')
    expect(result).to.contain('legitimate article')
  })

  it('filters out lines with keyword "sign up"', () => {
    const result = cleanText('Sign up today!\nThis article has enough words to pass the filter.', [])
    expect(result).to.not.contain('Sign up')
  })

  it('filters out lines with keyword "newsletter"', () => {
    const result = cleanText('Subscribe to our newsletter!\nThis article has enough words to pass the filter.', [])
    expect(result).to.not.contain('newsletter')
  })

  it('filters out lines with keyword "click here"', () => {
    const result = cleanText('Click here for more info!\nThis article has enough words to pass the filter.', [])
    expect(result).to.not.contain('click here')
  })

  it('filters out lines with keyword "free trial"', () => {
    const result = cleanText('Get your free trial!\nThis article has enough words to pass the filter.', [])
    expect(result).to.not.contain('free trial')
  })

  it('filters out mixed case keywords', () => {
    const result = cleanText('SIGN UP NOW FOR OUR NEWSLETTER!\nThis article has enough words to pass the filter.', [])
    expect(result).to.not.contain('SIGN UP')
    expect(result).to.contain('article')
  })

  it('applies custom filter words', () => {
    const result = cleanText('This is a legitimate article with lots of good words.\nRemove me because of custom filter.', ['custom filter'])
    expect(result).to.not.contain('custom filter')
    expect(result).to.contain('This is a legitimate')
  })

  it('trims whitespace from each line', () => {
    const input = '   Line with leading spaces to trim properly   \n  Another trimmed line here too  '
    const result = cleanText(input, [])
    expect(result).to.equal('Line with leading spaces to trim properly\nAnother trimmed line here too')
  })

  it('preserves newlines between valid lines', () => {
    const input = 'First valid line here with text.\nSecond valid line here with text.\nThird valid line here with text.'
    const result = cleanText(input, [])
    expect(result).to.contain('First valid line here with text.')
    expect(result).to.contain('Second valid line here with text.')
    expect(result).to.contain('Third valid line here with text.')
  })

  it('filters very short lines like single words', () => {
    const input = 'Single\nA word\nThis has enough words to survive the filter\n'
    const result = cleanText(input, [])
    expect(result).to.equal('This has enough words to survive the filter')
  })
})
