'use strict'

const fs = require('fs')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const args = process.argv.slice(2)

const output = args[1] || "output.json"
const getRedirects = args[2] === "true" || false
const debug = args[3] === "true" || false
const start = new Date()

fetch(`https://news.google.com/search?q=${args[0]}`).then(res => res.text()).then(data => {
    const $ = cheerio.load(data)
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
    if (getRedirects) {
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
    fs.writeFile(output, JSON.stringify(results), function(err) {
        if(err) {
            return console.log(err)
        }
        console.log(`File written to ${output}`)
        if (debug) {
            const end = new Date()
            console.log(`Executed in ${(end.getTime() - start.getTime()) / 1000} seconds`)
        }
    })
})