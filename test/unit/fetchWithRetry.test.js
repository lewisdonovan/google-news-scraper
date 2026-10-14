import expect from 'expect.js'
import fetchWithRetry from '../../dist/tsc/fetchWithRetry.js'

const respond = (status) => ({ ok: status < 400, status, headers: new Map(), text: async () => '' })
const fast = { baseDelayMs: 1 }

describe('fetchWithRetry', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('retries a 503 and returns the later success', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(respond(503))
      .mockResolvedValueOnce(respond(200))
    const response = await fetchWithRetry('https://example.com', {}, fast)
    expect(response.status).to.equal(200)
    expect(global.fetch.mock.calls).to.have.length(2)
  })

  it('returns the last response once attempts run out', async () => {
    global.fetch = jest.fn(async () => respond(429))
    const response = await fetchWithRetry('https://example.com', {}, { ...fast, attempts: 3 })
    expect(response.status).to.equal(429)
    expect(global.fetch.mock.calls).to.have.length(3)
  })

  it('does not retry other errors', async () => {
    global.fetch = jest.fn(async () => respond(404))
    const response = await fetchWithRetry('https://example.com', {}, fast)
    expect(response.status).to.equal(404)
    expect(global.fetch.mock.calls).to.have.length(1)
  })

  it('retries network failures, then rethrows', async () => {
    global.fetch = jest.fn(async () => { throw new Error('offline') })
    let error
    try { await fetchWithRetry('https://example.com', {}, { ...fast, attempts: 2 }) } catch (e) { error = e }
    expect(error.message).to.equal('offline')
    expect(global.fetch.mock.calls).to.have.length(2)
  })
})
