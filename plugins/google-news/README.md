# Google News plugin for Claude Code

Gives Claude live news from Google News through the [google-news-scraper MCP server](../../mcp/). Install it with:

```bash
/plugin install google-news --marketplace lewisdonovan/google-news-scraper
```

## Tools

| Tool | What it does |
| --- | --- |
| `search_news` | Search Google News for articles on any keyword, with a timeframe, language and country. |
| `top_stories` | The current top stories for a country and language, or the stories on a Google News topic page. |
| `get_article_text` | Fetch an article URL and return its readable body text, title, byline and publish time. |

## Data it sends

The server runs locally on your machine through `npx`. It sends:

* your search terms, language and country to `news.google.com`, to fetch Google News results;
* a request to each article URL you ask it to read, to fetch that page's HTML.

It has no account, API key, analytics or telemetry, and sends nothing to any other server.

## License

MIT, see [LICENSE.txt](../../LICENSE.txt).
