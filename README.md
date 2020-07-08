
# Google News Scraper
A lightweight package that scrapes article data from Google News. Simply pass a keyword or phrase, and the results are returned as an array of JSON objects.

* [Installation](#installation)
* [Usage](#usage)
* [Config](#config)
* [Output](#output)
* [Performance](#performance)
* [Contribute](#contribute)

## Installation
```bash
# Install via NPM
npm install google-news-scraper

# Install via Yarn
yarn add google-news-scraper
```

## Usage
```javascript
// Require the package
const googleNewsScraper = require('google-news-scraper')

// Execute within an async function, pass a config object (further documentation below)
const articles = await googleNewsScraper({
    searchTerm: "The Oscars",
    prettyURLs: false,
    timeframe: "5d"
})

```

## Config
The config object passed to the function above has the following properties:

### Search Term (required)
This is the search query you'd like to find articles for.

### Pretty URLs (required)
The URLs that Google News supplies for each article are "ugly" redirect links (eg: `"https://news.google.com/articles/CAIiEPgfWP_e7PfrSwLwvWeb5msqFwgEKg8IACoHCAowjuuKAzCWrzwwt4QY?hl=en-GB&gl=GB&ceid=GB%3Aen"`).

You can optionally ask the scraper to follow the redirect and retrieve the actual "pretty" URL (eg: `"https://www.nytimes.com/2020/01/22/movies/expanded-best-picture-oscar.html"`).

As you can imagine, this results in lots of additional HTTP requests, which negatively impact the scraper's performance. [In testing](https://github.com/lewisdonovan/google-news-scraper#performance), following redirects took around five times longer on average.

### Timeframe
The results can be filtered to articles published within a given timeframe prior to the requesst. The default is 7 days.

The format of the timeframe is a string comprised of a number, followed by a letter prepresenting the time operator. For example `1y` would signify 1 year. Full list of operators below:
* h = hours (eg: `12h`)
* d = days (eg: `7d`)
* m = months (eg: `6m`)
* y = years (eg: `1y`)

## Output
The output is an array of JSON objects, with each article following the structure below:

```json
[
    {
        "title":  "Article title",
        "subtitle":  "Article subtitle",
        "link":  "http://url-to-website.com/path/to/article",
        "image":"http://url-to-website.com/path/to/image.jpg",
        "source":  "Name of publication",
        "time":  "Time/date published (human-readable)"
    }, {
        ...
    }
]
```

## Performance
My test query returned 104 results, which took 1.566 seconds without redirects, and 7.36 seconds with redirects. I'm on a fibre connection, and other queries may return a different number of results, so your mileage may vary. 

## Upkeep
Please note that this is a web-scraper, which relies on DOM selectors, so any fundamental changes in the markup on the Google News site will probably break this tool. I'll try my best to keep it up-to-date, but many of these changes will be silent. Feel free to submit an issue if it stops working.

## Contribute
Please report bugs via the [issue tracker](https://github.com/lewisdonovan/google-news-scraper/issues), and feel free to [submit a PR](https://github.com/lewisdonovan/google-news-scraper/pulls) if you've fixed an open issue. Thanks.
