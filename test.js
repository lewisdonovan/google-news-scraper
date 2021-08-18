const gns = require('./index.js');

(async () => {
  try {
    const articles = await gns({
      searchTerm: "tech news",
      queryVars: {
        hl:"en-US",
        gl:"US",
        ceid:"US:en"
      },
      prettyURLs: true,
      timeframe: "5d",
      puppeteerArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })
    console.log(articles)
  } catch (e) {
    console.error(e)
  }
})()