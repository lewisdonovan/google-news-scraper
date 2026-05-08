import expect from 'expect.js'
import gns from '../index.js'

test('Should scrape articles content (using Proxies)', async () => {
  const articles = await gns({
    
    prettyURLs: true,
    timeframe: "1h",
    puppeteerArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    
  })
  expect(articles).to.not.be.empty()
}, 60000)