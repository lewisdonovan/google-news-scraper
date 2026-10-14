export const feedXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>"tesla when:7d" - Google News</title>
<item><title>Tesla's China-made EV sales quicken in September - Reuters</title><link>https://news.google.com/rss/articles/CBMiAU_yqLOne?oc=5</link><guid isPermaLink="false">CBMiAU_yqLOne</guid><pubDate>Fri, 09 Oct 2026 10:17:44 GMT</pubDate><description>&lt;a href="https://news.google.com/rss/articles/CBMiAU_yqLOne?oc=5"&gt;Tesla's China-made EV sales quicken in September&lt;/a&gt;</description><source url="https://www.reuters.com">Reuters</source></item>
<item><title>Tesla drops 'Full Self-Driving' brand name in Europe - CNBC</title><link>https://news.google.com/rss/articles/CBMiAU_yqLTwo?oc=5</link><guid isPermaLink="false">CBMiAU_yqLTwo</guid><pubDate>Fri, 09 Oct 2026 17:10:13 GMT</pubDate><source url="https://www.cnbc.com">CNBC</source></item>
<item><title></title><link>https://news.google.com/rss/articles/CBMiEmpty?oc=5</link><pubDate>Fri, 09 Oct 2026 17:10:13 GMT</pubDate></item>
</channel></rss>`

export const articlePage = (sg, ts) =>
  `<html><body><c-wiz><div jscontroller="aLI87" data-n-a-id="x" data-n-a-ts="${ts}" data-n-a-sg="${sg}"></div></c-wiz></body></html>`

export const batchResponse = (url) =>
  `)]}'\n\n[["wrb.fr","Fbv4je",${JSON.stringify(JSON.stringify(['garturlres', url, 1]))},null,null,null,"generic"],["di",19]]`
