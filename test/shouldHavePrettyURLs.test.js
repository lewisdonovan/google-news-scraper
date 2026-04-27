import expect from 'expect.js'
import gns from '../index.js'

const FIXTURE_HTML = `
<html><body>
  <article>
    <h4>Example Title</h4>
    <a href="./read/aHR0cHM6Ly9leGFtcGxlLmNvbS9zdG9yeQ">Read</a>
    <figure><img src="https://example.com/img.jpg" /></figure>
    <div data-n-tid>Example Source</div>
    <div><time datetime="2024-01-01T00:00:00.000Z">1h</time></div>
  </article>
</body></html>
`

jest.mock('puppeteer', () => {
  const page = {
    setViewport: jest.fn(),
    setUserAgent: jest.fn(),
    setRequestInterception: jest.fn(),
    on: jest.fn(),
    setCookie: jest.fn(),
    goto: jest.fn(),
    $: jest.fn(async () => { throw new Error('no consent banner') }),
    click: jest.fn(),
    waitForNavigation: jest.fn(),
    content: jest.fn(async () => FIXTURE_HTML),
    close: jest.fn(),
  }

  return {
    defaultArgs: () => [],
    launch: jest.fn(async () => ({
      newPage: jest.fn(async () => page),
      close: jest.fn(),
    })),
  }
})

test('Should have prettyURLs', async () => {
  const articles = await gns({
    searchTerm: "dogecoin",
    queryVars: {
      hl:"en-US",
      gl:"US",
      ceid:"US:en"
    },
    prettyURLs: true,
    timeframe: "1h",
    puppeteerArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
  expect(articles[0].link).to.not.contain('news.google.com/articles');
}, 60000)