
  

# Google News Scraper

  

A lightweight command-line tool that scrapes article data from Google News. Simply pass a keyword or phrase as a command-line argument, and the results are outputted in a JSON file.

  

## Installation

```console

# Clone the repo

git clone https://github.com/lewisdonovan/google-news-scraper

  

# Enter the repo directory

cd google-news-scraper

  

# Install the dependencies:

npm install

  

# Run your search query:

node index.js "The Oscars"

```

## Output format

The output is a JSON array, with each article following the structure below:

```json

{

"title":  "Article title",  // String

"subtitle":  "Article subtitle/excerpt",  // String

"link":  "http://url-to-website.com/path/to/article",  // String

"image":"http://url-to-website.com/path/to/image.jpg",  // String

"source":  "Name of publication",  // String

"time":  "Time/date published (human-readable)"  // String

}

```

## Arguments

The scraper accepts two arguments:
1. The search term, which should be wrapped in quotes (eg: `"My local news"`)
2. and a Boolean that defines whether or not the scraper will follow redirects.
	* If set to `false` (or omitted), the scraper won't follow redirects, and will return Google News URLs (eg: `"https://news.google.com/articles/CAIiEPgfWP_e7PfrSwLwvWeb5msqFwgEKg8IACoHCAowjuuKAzCWrzwwt4QY?hl=en-GB&gl=GB&ceid=GB%3Aen"`).
	* If set to `true`, the scraper will follow the redirect and return the final URL (eg: `"https://www.nytimes.com/2020/01/22/movies/expanded-best-picture-oscar.html"`). This results in lots of additional HTTP requests, so makes the scraper takes roughly five times longer.

## Performance
My test query returned 104 results, which took 1.566 seconds without redirects, and 7.36 seconds with redirects. I'm on a fibre connection, and other queries may return a different number of results, so your mileage may vary. 

## Upkeep
Please note that this is a web-scraper, which relies on DOM selectors, so any fundamental changes in the markup on the Google News site will probably break this tool. I'll try my best to keep it up-to-date, but many of these changes will be silent. Feel free to submit an issue if it stops working.

## Contribute
Please report bugs via the [issue tracker](https://github.com/lewisdonovan/google-news-scraper/issues), and feel free to [submit a PR](https://github.com/lewisdonovan/google-news-scraper/pulls) if you've fixed an open issue. Thanks.