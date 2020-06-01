'use strict'

const fs = require('fs')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const args = process.argv.slice(2)

const output = args[1] || "output.json"
const getRedirects = args[2] === "true" || false
const timeframe = args[3] || '30d'
const debug = args[4] === "true" || false
const start = new Date()
const url = `https://news.google.com/search?q=${args[0]} when:${timeframe}`

puppeteer.launch({ headless: true })
  .then(async (browser) => {
    let page = await browser.newPage()
    
    // Make the request look human
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

    // Make the request
    page.goto(url, { waitUntil: 'networkidle2' })
      .then(() => {
        let content = page.content()
        content
          .then(success => {
            // Get articles
            const $ = cheerio.load(success)
            const imgs = $('c-wiz img')
            const articles = $('c-wiz article')
            let results = []
            let i = 0
            $(articles).each(function() {
              results.push({
                "title": $(this).find('h3').text() || false,
                "subtitle": $(this).find('span').first().text() || false,
                "link": $(this).find('a').first().attr('href').replace('./', 'https://news.google.com/') || false,
                "image": $(imgs[i]).attr('src') || false,
                "source": $(this).find('div:last-child a').text() || false,
                "time": $(this).find('div:last-child time').text() || false
              })
              i++
            })
            return results
          }).then(results => {
            if (getRedirects) {
              // Get redirect URLs
              return Promise.all(results.map(article => {
                return fetch(article.link).then(res => res.text()).then(data => {
                  const _$ = cheerio.load(data)
                  article.link = _$('c-wiz a[rel=nofollow]').attr('href')
                  return article
                })
              })).then(articles => {
                return articles
              })
            } else {
              return results
            }
          }).then(results => {
            // Write JSON file
            fs.writeFile(output, JSON.stringify(results), function(err) {
              if(err) {
                return console.log(err)
              }
              console.log(`File written to ${output}`)
              if (debug) {
                const end = new Date()
                console.log(`Executed in ${(end.getTime() - start.getTime()) / 1000} seconds`)
              }
              process.exit()
            })
          })
      })
  }).catch((err) => {
    console.error(" CAUGHT ERROR ", err)
    process.exit()
  })