
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
node index.js "Brexit latest"
```

## Output format
The output is a JSON array, with each article following the structure below:
```json
{
        "title": "Article title", // String
        "subtitle": "Article subtitle/excerpt", // String
        "link": "http://url-to-website.com/path/to/article", // String
        "image":"http://url-to-website.com/path/to/image.jpg", // String
        "source": "Name of publication", // String
        "time": "Time/date published (human-readable)" // String
}
```
