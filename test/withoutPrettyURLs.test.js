const expect = require('expect.js');
const gns = require('../index.js');

test('Should have articles (without prettyURLs)', async () => {
  const articles = await gns({
    searchTerm: "ethereum",
    queryVars: {
      hl:"en-US",
      gl:"US",
      ceid:"US:en"
    },
    prettyURLs: false,
    timeframe: "1h",
    puppeteerArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
  expect(articles).to.not.be.empty()
}, 60000)