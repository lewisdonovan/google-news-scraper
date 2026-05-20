import expect from 'expect.js'

// Inlined mock factory for jest.mock (can't reference out-of-scope variables)
jest.mock('puppeteer', () => ({
  defaultArgs: () => [],
  launch: jest.fn(async () => ({
    newPage: jest.fn(async () => ({
      setViewport: jest.fn(),
      setUserAgent: jest.fn(),
      setRequestInterception: jest.fn(),
      on: jest.fn(() => {}),
      setCookie: jest.fn(),
      goto: jest.fn(async () => ({})),
      $: jest.fn(async () => ({})),
      click: jest.fn(async () => {}),
      waitForNavigation: jest.fn(async () => {}),
      content: jest.fn(async () => `
        <html><body>
          <article>
            <h4>Test Article</h4>
            <a href="./read/aHR0cHM6Ly9leGFtcGxlLmNvbS9zdG9yeQ==">Link</a>
            <figure><img src="https://example.com/img.jpg" /></figure>
            <div data-n-tid>Source</div>
            <div><time datetime="2024-01-15T10:00:00Z">2h ago</time></div>
          </article>
        </body></html>
      `),
      close: jest.fn(),
    })),
    close: jest.fn(),
  })),
}))

const gns = require('../../index.js')

function createPuppeteer(html) {
  return {
    defaultArgs: () => [],
    launch: jest.fn(async () => ({
      newPage: jest.fn(async () => ({
        setViewport: jest.fn(),
        setUserAgent: jest.fn(),
        setRequestInterception: jest.fn(),
        on: jest.fn(() => {}),
        setCookie: jest.fn(),
        goto: jest.fn(async () => ({})),
        $: jest.fn(async () => ({})),
        click: jest.fn(async () => {}),
        waitForNavigation: jest.fn(async () => {}),
        content: jest.fn(async () => html),
        close: jest.fn(),
      })),
      close: jest.fn(),
    })),
  }
}

describe('googleNewsScraper - happy paths', () => {
  it('returns articles with prettyURLs resolved', async () => {
    const articles = await gns({ prettyURLs: true, timeframe: '1h' })

    expect(articles).to.not.be.empty()
    expect(articles[0].title).to.equal('Test Article')
    expect(articles[0].articleType).to.equal('regular')
    expect(articles[0].link).to.not.contain('news.google.com')
    expect(articles[0].image).to.equal('https://example.com/img.jpg')
    expect(articles[0].source).to.equal('Source')
  })

  it('returns articles with Google News links when prettyURLs is false', async () => {
    const articles = await gns({ prettyURLs: false, timeframe: '1h' })

    expect(articles).to.not.be.empty()
    expect(articles[0].link).to.contain('news.google.com')
  })

  it('returns front page articles when no searchTerm', async () => {
    const articles = await gns({ prettyURLs: true, timeframe: '7d' })

    expect(articles).to.not.be.empty()
    expect(articles[0].title).to.equal('Test Article')
  })
})

describe('googleNewsScraper - limit behavior', () => {
  it('returns all articles when limit exceeds available', async () => {
    const articles = await gns({ limit: 99, prettyURLs: false, timeframe: '1h' })
    expect(articles).to.have.length(1)
  })

  it('handles limit of 0 by returning empty array', async () => {
    const articles = await gns({ limit: 0, prettyURLs: false, timeframe: '1h' })
    expect(articles).to.have.length(0)
  })
})

describe('googleNewsScraper - edge cases', () => {
  it('returns empty array when no articles found', async () => {
    jest.resetModules()
    jest.doMock('puppeteer', () => createPuppeteer('<html><body></body></html>'))
    const gns2 = require('../../index.js')
    const articles = await gns2({ prettyURLs: false, timeframe: '1h' })
    expect(articles).to.have.length(0)
  })

  it('filters out articles without titles', async () => {
    jest.resetModules()
    jest.doMock('puppeteer', () => createPuppeteer(`
      <html><body>
        <article>
          <a href="./article/CAIiBkIz">Link</a>
          <figure><img src="https://example.com/img.jpg" /></figure>
          <div data-n-tid>Source</div>
          <div><time datetime="2024-01-15T10:00:00Z">1h ago</time></div>
        </article>
      </body></html>
    `))
    const gns2 = require('../../index.js')
    const articles = await gns2({ prettyURLs: false, timeframe: '1h' })
    expect(articles).to.have.length(0)
  })

  it('handles consent banner present', async () => {
    jest.resetModules()
    jest.doMock('puppeteer', () => createPuppeteer(`
      <html><body>
        <button aria-label="Reject all">Reject</button>
        <article>
          <h4>After Consent</h4>
          <a href="./read/aHR0cHM6Ly9leGFtcGxlLmNvbS9hZnRlci1jb25zZW50">Link</a>
          <figure><img src="https://example.com/img.jpg" /></figure>
          <div data-n-tid>Source</div>
          <div><time datetime="2024-01-15T10:00:00Z">1h ago</time></div>
        </article>
      </body></html>
    `))
    const gns2 = require('../../index.js')
    const articles = await gns2({ prettyURLs: true })
    expect(articles).to.not.be.empty()
    expect(articles[0].title).to.equal('After Consent')
  })

  it('handles article with relative image URL', async () => {
    jest.resetModules()
    jest.doMock('puppeteer', () => createPuppeteer(`
      <html><body>
        <article>
          <h4>Relative Image</h4>
          <a href="./read/aHR0cHM6Ly9leGFtcGxlLmNvbS9yZWxhdGl2ZQ==">Link</a>
          <figure><img src="/relative/path/img.jpg" /></figure>
          <div data-n-tid>Source</div>
          <div><time datetime="2024-01-15T10:00:00Z">1h ago</time></div>
        </article>
      </body></html>
    `))
    const gns2 = require('../../index.js')
    const articles = await gns2({ prettyURLs: true })
    expect(articles).to.have.length(1)
    expect(articles[0].image).to.equal('https://news.google.com/relative/path/img.jpg')
  })

  it('handles article with no image', async () => {
    jest.resetModules()
    jest.doMock('puppeteer', () => createPuppeteer(`
      <html><body>
        <article>
          <h4>No Image</h4>
          <a href="./read/aHR0cHM6Ly9leGFtcGxlLmNvbS9ub2ltYWdl">Link</a>
          <div data-n-tid>Source</div>
          <div><time datetime="2024-01-15T10:00:00Z">1h ago</time></div>
        </article>
      </body></html>
    `))
    const gns2 = require('../../index.js')
    const articles = await gns2({ prettyURLs: true })
    expect(articles).to.have.length(1)
    expect(articles[0].image).to.equal('')
  })

  it('returns empty source when source element missing', async () => {
    jest.resetModules()
    jest.doMock('puppeteer', () => createPuppeteer(`
      <html><body>
        <article>
          <h4>No Source</h4>
          <a href="./read/aHR0cHM6Ly9leGFtcGxlLmNvbS9ub3NvdXJjZQ==">Link</a>
          <figure><img src="https://example.com/img.jpg" /></figure>
          <div><time datetime="2024-01-15T10:00:00Z">1h ago</time></div>
        </article>
      </body></html>
    `))
    const gns2 = require('../../index.js')
    const articles = await gns2({ prettyURLs: true })
    expect(articles).to.have.length(1)
    expect(articles[0].source).to.equal('')
  })
})
