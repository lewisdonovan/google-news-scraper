# 📰 Google News Scraper

A lightweight package that scrapes article data from [Google News](https://news.google.com). Simply pass a keyword or phrase, and the results are returned as an array of JSON objects.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://donate.stripe.com/6oE7ue8n57wk4PS7ss)

 ![Google News Scraper](https://repository-images.githubusercontent.com/236499568/08f79682-be8e-4625-b84d-7d6ad86bd2d8)

* [Installation](#installation-)
* [Usage](#usage-%EF%B8%8F)
* [Output](#output-)
* [Config](#config-%EF%B8%8F)
* [Performance](#performance-)
* [Upkeep](#upkeep-)
* [Bugs](#bugs-)
* [Contribute](#contribute-)
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
const googleNewsScraper = require('google-news-scraper');

const articles = await googleNewsScraper({ searchTerm: "The Oscars" });

```
Full documentation on the [config object](#config) can be found below.

## Output 📲
The output is an array of JSON objects, with each article following the structure below:

```json
[
    {
        "title":  "Article title",
        "link":  "http://url-to-website.com/path/to/article",
        "image":"http://url-to-website.com/path/to/image.jpg",
        "source":  "Name of publication",
        "datetime": 2024-05-13T08:02:22.000Z,
        "time":  "Time/date published (human-readable)", 
        "articleType": "String, one of ['regular' | 'topicFeatured' | 'topicSmall']"
    }
]
```

## Config ⚙️
The config object passed to the function above has the following properties:

#### searchTerm
This is the search query you'd like to find articles for, simply pass the search string like so: `searchTerm: "The Oscars"`. 

The search term is no longer a required field, as [hahagu](https://github.com/hahagu/) added support for topic pages in [#44](https://github.com/lewisdonovan/google-news-scraper/pull/44). If `searchTerm` and `baseUrl` are both supplied, the scraper will just return results from the [Google News homepage](https://news.google.com/).

### baseUrl
The `baseUrl` property enables you to specify an alternate base URL for your search. This is useful when you want to scrape, for example, a specific [Google news topic](https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB). 

***PLEASE NOTE***: Using both a `baseUrl` that points to a topic AND a `searchTerm` is not advised, as the `searchTerm` will typically be ignored in favour of the topic in the `baseUrl`.

In the scraped URL, your `baseUrl` will be immediately followed by query parameters (eg: `?hl=en-US&gl=US&ceid=US`), so it doesn't matter whether your `baseUrl` has a trailing slash or not.

Defaults to `https://news.google.com/search`

#### prettyURLs
The URLs that Google News supplies for each article are "ugly" links (eg: `"https://news.google.com/articles/CAIiEPgfWP_e7PfrSwLwvWeb5msqFwgEKg8IACoHCAowjuuKAzCWrzwwt4QY?hl=en-GB&gl=GB&ceid=GB%3Aen"`), buy default the scraper will retrieve the actual "pretty" URL (eg: `"https://www.nytimes.com/2020/01/22/movies/expanded-best-picture-oscar.html"`). This is done using some base64 decoding, so the overhead is negligible. To prevent this default behaviour and retrieve the "ugly" links instead, pass `prettyURLs: false` to the config object.

Credit to [anthonyfranc](https://github.com/lewisdonovan/google-news-scraper/issues/42) for the base64 decode fix 🙏

Defaults to `true`.

#### timeframe
The results can be filtered to articles published within a given timeframe prior to the request.
The format of the timeframe is a string comprised of a number, followed by a letter prepresenting the time operator. For example `1y` would signify 1 year. Full list of operators below:
* h = hours (eg: `12h`)
* d = days (eg: `7d`)
* m = months (eg: `6m`)
* y = years (eg: `1y`)

This setting has no default, leaving it blank will return the default results that Google gives if you don't specify a timeframe.

#### getArticleContent
By default, the scraper does not return the article content, as this would require Puppeteer to navigate to each individual article in the results (increasing execution time significantly). If you would like to enable this behaviour, and receive the content of each article, simply pass `getArticleContent: true,` in the config. This will add two fields to each article in the output: `content` and `favicon`.

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

***PLEASE NOTE:*** Due to the large amount of variable factors to take into account, this feature fails on many websites. All errors are handled gracefully and wil return an empty string as the content. Please ensure you handle such outcomes in your application.

Defaults to `false`

#### queryVars
An object of additional query params to add to the Google News URL string, formatted as key value pairs. This can be useful if you want to search for articles in a specific language, for example:
```javascript
const articles = await googleNewsScraper({
    searchTerm: "Últimas noticias en Madrid",
    queryVars: {
        hl:"es-ES",
        gl:"ES",
        ceid:"ES:es"
    },
});
```

Defaults to `null`

#### puppeteerArgs
An array of Chromium flags to pass to the browser instance. By default, this will be an empty array. A full list of available flags can be found [here](https://peter.sh/experiments/chromium-command-line-switches/). NB: if you are launching this in a Heroku app, you will need to pass the `--no-sandbox` and `--disable-setuid-sandbox` flags, as explained in [this SO answer](https://stackoverflow.com/a/52228855/7546845).

Defaults to `[]`

#### puppeteerHeadlessMode
Whether or not Puppeteer should run in [headless mode](https://www.browserstack.com/guide/puppeteer-headless). Running in headless mode increases performance by approximately 30% (credit to [ole-ve](https://github.com/lewisdonovan/google-news-scraper/pull/45) for finding this). If you're not sure about this setting, leave it as it is.

Defaults to `true`

## Performance 📈
My test query returned 94 results, which took 4.5 seconds with article content and 3.6 seconds without it. I'm on a fibre connection, and other queries may return a different number of results, so your mileage may vary. 

## Upkeep 🧹
Please note that this is a web-scraper, which relies on DOM selectors, so any fundamental changes in the markup on the Google News site will probably break this tool. I'll try my best to keep it up-to-date, but changes to the markup on Google News will be silent and therefore difficult to keep track of. Feel free to submit an issue if the tool stops working.

## Bugs 🐞
Due to the size of Chromium, this package is too large to run on Vercel free tier. For more information please refer to [this issue](https://github.com/lewisdonovan/google-news-scraper/issues/41).

Please report bugs via the [issue tracker](https://github.com/lewisdonovan/google-news-scraper/issues).

## Contribute 🤝
Feel free to [submit a PR](https://github.com/lewisdonovan/google-news-scraper/pulls) if you've fixed an open issue. Thank you.

## Python version 🐍
If you're looking for a Python version, there's one [here](https://github.com/morganbarber/python-news-scraper/). Please note, the Python version is a fork and is maintained separately. If you have any issues with the Python version, please open an issue on that repo instead here.