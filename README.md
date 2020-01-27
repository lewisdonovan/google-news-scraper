
# Google News Scraper
A lightweight command-line tool that scrapes article data from Google News. Simply pass a keyword or phrase as a command-line argument, and the results are written to a local JSON file.

* [Installation](#installation)
* [Usage](#usage)
* [URLs](#pretty-urls)
* [Output format](#output-format)
* [Performance](#performance)
* [Contribute](#contribute)

## Installation
```console
# Clone the repo
git clone https://github.com/lewisdonovan/google-news-scraper

# Enter the repo directory
cd google-news-scraper

# Install the dependencies:
npm install
```

## Usage
The scraper accepts three arguments: "search term", "output filename", and "pretty URLs" (which are explained in more detail [below](#pretty-urls))
They take the following format:

```console
node index.js [STRING] [STRING] [BOOLEAN]
```
At a minimum, you must include a search term:
```console
# Search for news stories about The Oscars:
node index.js "The Oscars"
```

The other arguments are optional and can be used like so:
```console
# Give a custom filename of "oscars-news.json"
node index.js "The Oscars" "oscars-news.json"

# Follow redirects and retrieve "pretty" URLs
node index.js "The Oscars" "oscars-news.json" true
```

## Pretty URLs
The URLs that Google News supplies for each article are "ugly" redirect links (eg: `"https://news.google.com/articles/CAIiEPgfWP_e7PfrSwLwvWeb5msqFwgEKg8IACoHCAowjuuKAzCWrzwwt4QY?hl=en-GB&gl=GB&ceid=GB%3Aen"`).

You can optionally ask the scraper to follow the redirect and retrieve the actual "pretty" URL (eg: `"https://www.nytimes.com/2020/01/22/movies/expanded-best-picture-oscar.html"`).

As you can imagine, this results in lots of additional HTTP requests, which negatively impact the scraper's performance. [In testing](https://github.com/lewisdonovan/google-news-scraper#performance), following redirects took around five times longer on average.

## Output format
The output is a JSON array, with each article following the structure below:

```json
{
    "title":  "Article title",
    "subtitle":  "Article subtitle",
    "link":  "http://url-to-website.com/path/to/article",
    "image":"http://url-to-website.com/path/to/image.jpg",
    "source":  "Name of publication",
    "time":  "Time/date published (human-readable)"
}
```

## Performance
My test query returned 104 results, which took 1.566 seconds without redirects, and 7.36 seconds with redirects. I'm on a fibre connection, and other queries may return a different number of results, so your mileage may vary. 

## Upkeep
Please note that this is a web-scraper, which relies on DOM selectors, so any fundamental changes in the markup on the Google News site will probably break this tool. I'll try my best to keep it up-to-date, but many of these changes will be silent. Feel free to submit an issue if it stops working.

## Contribute
Please report bugs via the [issue tracker](https://github.com/lewisdonovan/google-news-scraper/issues), and feel free to [submit a PR](https://github.com/lewisdonovan/google-news-scraper/pulls) if you've fixed an open issue. Thanks.
