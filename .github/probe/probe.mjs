// Temporary diagnostic: dumps live Google News markup so scraper fixes can be made
// from an environment that cannot reach google.com. Removed before merge.
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const log = (label, v) => console.log(`\n===== ${label} =====\n${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
for (const url of [
  'https://news.google.com/search?q=tesla&when=7d',
  'https://news.google.com/search?q=tesla&when=7d&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/?hl=en-US&gl=US&ceid=US:en',
]) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(url, { waitUntil: 'networkidle2' });
  const html = await page.content();
  const $ = cheerio.load(html);
  log(`URL ${url}`, { finalUrl: page.url(), title: $('title').text(), length: html.length, articles: $('article').length,
    articleLinks: $('a[href^="./article"]').length, readLinks: $('a[href^="./read"]').length,
    cwiz: $('c-wiz').length, h4: $('h4').length, time: $('time').length });
  $('article').slice(0, 3).each((i, el) => log(`ARTICLE ${i}`, $.html(el).slice(0, 4000)));
  if (!$('article').length) log('BODY START', $('body').html()?.slice(0, 6000) ?? '');
  // Grab a sample of anchors with hrefs to learn the link structure
  log('HREF SAMPLE', [...new Set($('a[href]').map((_, a) => $(a).attr('href')).get())].slice(0, 40));
  await page.close();
}
await browser.close();

// RSS feed as a potential fallback
const rss = await fetch('https://news.google.com/rss/search?q=tesla+when:7d&hl=en-US&gl=US&ceid=US:en', { headers: { 'User-Agent': UA } });
const rssText = await rss.text();
log('RSS', { status: rss.status, length: rssText.length, items: (rssText.match(/<item>/g) || []).length });
log('RSS SAMPLE', rssText.slice(0, 3000));

// Pretty URL: try decoding the first article id via batchexecute
const id = (rssText.match(/news\.google\.com\/rss\/articles\/([A-Za-z0-9_-]+)/) || [])[1];
log('ARTICLE ID', id ?? 'none');
if (id) {
  const r = await fetch(`https://news.google.com/rss/articles/${id}`, { headers: { 'User-Agent': UA } });
  const t = await r.text();
  const sg = (t.match(/data-n-a-sg="([^"]+)"/) || [])[1];
  const ts = (t.match(/data-n-a-ts="([^"]+)"/) || [])[1];
  log('ARTICLE PAGE', { status: r.status, finalUrl: r.url, sg: !!sg, ts, snippet: t.slice(0, 1500) });
  if (sg && ts) {
    const inner = JSON.stringify(['garturlreq', [['X','X',['X','X'],null,null,1,1,'US:en',null,1,null,null,null,null,null,0,1],'X','X',1,[1,1,1],1,1,null,0,0,null,0], id, Number(ts), sg]);
    const body = 'f.req=' + encodeURIComponent(JSON.stringify([[['Fbv4je', inner, null, 'generic']]]));
    const d = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', { method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': UA }, body });
    log('BATCHEXECUTE', { status: d.status, text: (await d.text()).slice(0, 1500) });
  }
}
