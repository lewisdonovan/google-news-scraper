'use strict'

const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fetch = require('node-fetch')

module.exports = async config => {
  const url = `https://news.google.com/search?q=${config.searchTerm} when:${config.timeframe || '7d'}`
  const puppeteerConfig = {
    headless:true,
    args: config.puppeteerArgs || []
  }
  const browser = await puppeteer.launch(puppeteerConfig)
  const page = await browser.newPage()
  page.setViewport({ width: 1366, height: 768 })
  page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36')
  page.setRequestInterception(true)
  page.on('request', request => {
    if (!request.isNavigationRequest()) {
      request.continue()
      return
    }
    const headers = request.headers()
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
    headers['Accept-Encoding'] = 'gzip'
    headers['Accept-Language'] = 'en-US,en;q=0.9,es;q=0.8'
    headers['Upgrade-Insecure-Requests'] = 1
    headers['Referer'] = 'https://www.google.com/'
    request.continue({ headers })
  })
  await page.goto(url, { waitUntil: 'networkidle2' })
  
  const content = await page.content()
  const $ = cheerio.load(content)
  const imgs = $('c-wiz img')
  const articles = $('c-wiz article')
  let results = []
  let i = 0

  $(articles).each(function() {
    const hasSubArticles = $(this).siblings('div[jsname]').length
    if (hasSubArticles) {
      results.push({
        "title": $(this).find('h3').text() || false,
        "subtitle": $(this).find('span').first().text() || false,
        "link": $(this).find('a').first().attr('href').replace('./', 'https://news.google.com/') || false,
        "image": $(imgs[i]).attr('src') || false,
        "source": $(this).find('div:last-child a').text() || false,
        "time": $(this).find('div:last-child time').text() || false
      })
      const subArticles = $(this).siblings('div[jsname]').find('article')
      $(subArticles).each(function() {
        results.push({
          "title": $(this).find('h4').text() || $(this).find('h4 a').text() || false,
          "subtitle": $(this).find('span').first().text() || false,
          "link": $(this).find('a').first().attr('href').replace('./', 'https://news.google.com/') || false,
          "image": $(imgs[i]).attr('src') || false,
          "source": $(this).find('div:last-child a').text() || false,
          "time": $(this).find('div:last-child time').text() || false
        })
      })
    } else {
      results.push({
        "title": $(this).find('h3').text() || false,
        "subtitle": $(this).find('span').first().text() || false,
        "link": $(this).find('a').first().attr('href').replace('./', 'https://news.google.com/') || false,
        "image": $(imgs[i]).attr('src') || false,
        "source": $(this).find('div:last-child a').text() || false,
        "time": $(this).find('div:last-child time').text() || false
      })
    }
    i++
  })

  if (config.prettyURLs) {
    results = await Promise.all(results.map(article => {
      return fetch(article.link).then(res => res.text()).then(data => {
        const _$ = cheerio.load(data)
        article.link = _$('c-wiz a[rel=nofollow]').attr('href')
        return article
      })
    }))
  }
  
  await page.close()
  await browser.close()

  return results.filter(result => result.title)

}