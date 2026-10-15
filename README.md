# 📰 Google News Scraper

[![npm version](https://img.shields.io/npm/v/google-news-scraper.svg)](https://www.npmjs.com/package/google-news-scraper)
[![npm downloads](https://img.shields.io/npm/dm/google-news-scraper.svg)](https://www.npmjs.com/package/google-news-scraper)
[![Live smoke test](https://github.com/lewisdonovan/google-news-scraper/actions/workflows/smoke.yml/badge.svg)](https://github.com/lewisdonovan/google-news-scraper/actions/workflows/smoke.yml)
[![License: MIT](https://img.shields.io/npm/l/google-news-scraper.svg)](LICENSE.txt)

Get [Google News](https://news.google.com) results as JSON in one line of Node.js. Search any keyword, topic or the top stories, and get back titles, publisher links, sources and publish dates.

```javascript
import googleNewsScraper from 'google-news-scraper';

const articles = await googleNewsScraper({ searchTerm: "OpenAI", timeframe: "1d" });
// [{ title: "...", link: "https://www.reuters.com/...", source: "Reuters", datetime: "2026-10-14T09:12:00.000Z", time: "3 hours ago", ... }]
```

* ⚡ **No headless browser.** Results come straight from Google News feeds, so a search is a single HTTP request and runs happily on serverless platforms such as Vercel and AWS Lambda.
* 🔗 **Real publisher URLs.** Google's redirect links are resolved to the original article on the publisher's site.
* 🌍 **Any language or region.** Pass Google's `hl`/`gl`/`ceid` parameters to search local editions.
* 🧠 **Optional full text.** Turn on `getArticleContent` to pull each article's body text, ready for summarisation or LLM pipelines.
* 🟦 **TypeScript types included**, and works with both ESM `import` and CommonJS `require`.
* ✅ **Checked daily** against the live site, so breakages are caught before you notice them.

Good for news monitoring, brand and competitor tracking, market research, trading signals, newsletters and feeding fresh context to AI agents.

🤖 **Using an AI agent?** There's an [MCP server](mcp/) too, so Claude, Cursor and other MCP clients can search Google News directly: `npx -y google-news-scraper-mcp`.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://donate.stripe.com/6oE7ue8n57wk4PS7ss)

---

## Sponsors 💛

<p align="">
  <a href="https://serpapi.com/use-cases/news-monitoring?utm_source=lewisdonovan" target="_blank" rel="noopener nofollow">
    <img height="100" alt="SerpAPI logo" src="https://lewisdonovan.dev/images/projects/serpapi.png" style="margin:0;" />
  </a>
</p>

[SerpApi - The News Monitoring API](https://serpapi.com/use-cases/news-monitoring?utm_source=lewisdonovan). We help you access real-time search engine data via a simple API, which includes news from Google, Bing, and DuckDuckGo. 

**Want your product in front of developers building with news data?** Sponsorship puts your logo here and on the npm page. Sponsor via [GitHub Sponsors](https://github.com/sponsors/lewisdonovan), or [get in touch](https://github.com/lewisdonovan) to talk about placements.

---

* [Installation](#installation-)
* [Usage](#usage-%EF%B8%8F)
* [Output](#output-)
* [Config](#config-%EF%B8%8F)
* [TypeScript](#typescript-)
* [CommonJS](#common-js-)
* [Performance](#performance-)
* [Upgrading from v2](#upgrading-from-v2-)
* [Upkeep](#upkeep-)
* [Bugs](#bugs-)
* [Contribute](#contribute-)
* [MCP server](#mcp-server-)
* [Python version](#python-version-)

## Installation 🔌
```bash
# Install via NPM
npm install google-news-scraper
```

```bash
# Install via Yarn
yarn add google-news-scraper
```

## Usage 🕹️
Simply import the package and pass a config object.
```javascript
import googleNewsScraper from 'google-news-scraper';

// Search
const articles = await googleNewsScraper({ searchTerm: "The Oscars" });

// Top stories in the UK edition
const topStories = await googleNewsScraper({ queryVars: { hl: "en-GB", gl: "GB" } });

// A topic page
const tech = await googleNewsScraper({ baseUrl: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB" });
```
A minimum working example can be found in [this repo](https://github.com/lewisdonovan/gns-example). 
Full documentation on the [config object](#config) can be found below.

## Output 📲
The output is an array of JSON objects, with each article following the structure below:

```json
[
    {
        "title":  "Article title",
        "link":  "http://url-to-website.com/path/to/article",
        "image": "",
        "source":  "Name of publication",
        "sourceUrl": "https://url-to-website.com",
        "datetime": "2024-05-13T08:02:22.000Z",
        "time":  "2 hours ago",
        "articleType": "regular"
    }
]
```

`image` is always an empty string, because Google News feeds don't include thumbnails. It's kept so code written for v2 doesn't break.

## Config ⚙️
The config object passed to the function above has the following properties:

#### searchTerm
This is the search query you'd like to find articles for, simply pass the search string like so: `searchTerm: "The Oscars"`. 

The search term is no longer a required field, as [hahagu](https://github.com/hahagu/) added support for topic pages in [#44](https://github.com/lewisdonovan/google-news-scraper/pull/44). If `searchTerm` and `baseUrl` are both supplied, `searchTerm` wins. If neither is supplied, you get the [Google News](https://news.google.com/) top stories.

### baseUrl
The `baseUrl` property enables you to specify an alternate base URL for your search. This is useful when you want to scrape, for example, a specific [Google news topic](https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB). 

The scraper reads the RSS version of whatever page you pass, so `https://news.google.com/topics/ABC` is fetched as `https://news.google.com/rss/topics/ABC`. If neither `searchTerm` nor `baseUrl` is supplied, you get the top stories.

#### prettyURLs
The URLs that Google News supplies for each article are "ugly" links (eg: `"https://news.google.com/articles/CAIiEPgfWP_e7PfrSwLwvWeb5msqFwgEKg8IACoHCAowjuuKAzCWrzwwt4QY?hl=en-GB&gl=GB&ceid=GB%3Aen"`), buy default the scraper will retrieve the actual "pretty" URL (eg: `"https://www.nytimes.com/2020/01/22/movies/expanded-best-picture-oscar.html"`). This takes two small requests to Google per article, run five at a time. To prevent this default behaviour and retrieve the "ugly" links instead, pass `prettyURLs: false` to the config object.

Credit to [anthonyfranc](https://github.com/lewisdonovan/google-news-scraper/issues/42) for the base64 decode fix 🙏

Defaults to `true`.

#### timeframe
The results can be filtered to articles published within a given timeframe prior to the request.
The format of the timeframe is a string comprised of a number, followed by a letter prepresenting the time operator. For example `1y` would signify 1 year. Full list of operators below:
* h = hours (eg: `12h`)
* d = days (eg: `7d`)
* m = months (eg: `6m`)
* y = years (eg: `1y`)

Defaults to `7d`.

#### getArticleContent
By default, the scraper does not return the article content, as this would require [Puppeteer](https://pptr.dev/) to navigate to each individual article in the results (increasing execution time significantly). If you would like to enable this behaviour, and receive the content of each article, simply pass `getArticleContent: true,` in the config. This will add two fields to each article in the output: `content` and `favicon`.

```json
[
    {
        "title":  "Article title",
        "link":  "https://url-to-website.com/path/to/article",
        "image":"https://url-to-website.com/path/to/image.jpg",
        "source":  "Name of publication",
        "time":  "Time/date published (human-readable)", 
        "content": "The full text content of the article...", 
        "favicon": "https://url-to-website.com/path/to/favicon.png",
    }
]
```

This is the only feature that needs a headless browser. Puppeteer is an optional dependency since v3, so install it yourself to use this feature:
```bash
npm install puppeteer
```

***PLEASE NOTE:*** Due to the large amount of variable factors to take into account, this feature fails on many websites. All errors are handled gracefully and wil return an empty string as the content. Please ensure you handle such outcomes in your application.

Defaults to `false`

#### logLevel
You can customise the log level to any of the following:

- `none`: No logs will be output at all.
- `error`: Only errors will be outputted to the log.
- `warn`: Errors and warnings will be output to the log. 
- `info`: Info, errors and warnings will be output to the log. 
- `verbose`: All of the above and potentially more. Currently there are no specifically verbose logs, but in future I may move some of the info logs to verbose and/or add some debugging info there.

Defaults to `error`.

#### queryVars
An object of additional query params to add to the Google News URL string, formatted as key value pairs. This can be useful if you want to search for articles in a specific language, for example:
```javascript
const articles = await googleNewsScraper({
    searchTerm: "Últimas noticias en Madrid",
    queryVars: {
        gl:"ES",
        ceid:"ES:es"
    },
});
```

Defaults to `null`

#### puppeteerArgs
Only used with `getArticleContent`. An array of Chromium flags to pass to the browser instance. By default, this will be an empty array. A full list of available flags can be found [here](https://peter.sh/experiments/chromium-command-line-switches/). NB: if you are launching this in a Heroku app, you will need to pass the `--no-sandbox` and `--disable-setuid-sandbox` flags, as explained in [this SO answer](https://stackoverflow.com/a/52228855/7546845).

Defaults to `[]`

#### puppeteerHeadlessMode
Only used with `getArticleContent`. Whether or not Puppeteer should run in [headless mode](https://www.browserstack.com/guide/puppeteer-headless). Running in headless mode increases performance by approximately 30% (credit to [ole-ve](https://github.com/lewisdonovan/google-news-scraper/pull/45) for finding this). If you're not sure about this setting, leave it as it is.

Defaults to `true`

#### limit
The total number of articles that you would like to be returned. Google News feeds return at most 100 articles.

Defaults to `99` 

## TypeScript 💙
Google News Scraper includes full [TypeScript](https://typescriptlang.org/) definitions. 

Your IDE should pick the types up automatically, but if not you can find them in the `dist/tsc/` folder.

## Common JS 👴🏻
Google News Scraper is built to work as an [ESM module](https://nodejs.org/api/esm.html) out of the box, but also works as a [Common JS module](https://nodejs.org/api/modules.html) too, just use `require` instead of `import`:
```javascript
const googleNewsScraper = require('google-news-scraper');

const articles = await googleNewsScraper({ searchTerm: "The Oscars" });

```

## Performance 📈
Since v3 the scraper reads Google News feeds directly instead of driving a browser, so a search without `prettyURLs` is a single HTTP request. Resolving publisher URLs adds a couple of small requests per article. It's light enough to run on serverless platforms such as Vercel and AWS Lambda.

## Upgrading from v2 ⬆️
v3 swaps the headless browser for Google News RSS feeds, after Google's markup changes broke the v2 scraper.

* Puppeteer is no longer installed automatically. You only need it for `getArticleContent`, so run `npm install puppeteer` if you use that.
* `image` is always an empty string, and `articleType` is always `"regular"`.
* `time` is now a relative time such as `"2 hours ago"`, and articles have a new `sourceUrl` field.
* Node 18 or later is required.

## Upkeep 🧹
A [live smoke test](.github/workflows/smoke.yml) runs against Google News every day, so breakages are spotted quickly. Feel free to submit an issue if the tool stops working.

## Bugs 🐞
Please report bugs via the [issue tracker](https://github.com/lewisdonovan/google-news-scraper/issues).

## Contribute 🤝
Feel free to [submit a PR](https://github.com/lewisdonovan/google-news-scraper/pulls) if you've fixed an open issue. Thank you.

## MCP server 🤖
The [`mcp/`](mcp/) folder holds `google-news-scraper-mcp`, a Model Context Protocol server built on this package. Add it to Claude, Cursor, VS Code or any other MCP client and your agent gets three tools: `search_news`, `top_stories` and `get_article_text`.

* **Claude Desktop:** download [google-news.mcpb](https://github.com/lewisdonovan/google-news-scraper/releases/download/mcp-v0.1.0/google-news.mcpb) and double-click it.
* **Claude Code:** `/plugin install google-news --marketplace lewisdonovan/google-news-scraper`
* **Everything else:** `npx -y google-news-scraper-mcp`, with setup instructions in its [README](mcp/README.md).

## Python version 🐍
If you're looking for a Python version, there's one [here](https://github.com/morganbarber/python-news-scraper/). Please note, the Python version is a fork and is maintained separately. If you have any issues with the Python version, please open an issue on that repo instead here.

## License 📄
[MIT](LICENSE.txt)
