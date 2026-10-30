# 📰 Google News MCP

Give any AI agent live news. This [Model Context Protocol](https://modelcontextprotocol.io) server lets Claude, Cursor, VS Code and other MCP clients search Google News, read the top stories in any country, and pull the text of an article.

It's built on [google-news-scraper](https://github.com/lewisdonovan/google-news-scraper), so there's no API key, no account and no headless browser. Results come with the real publisher URL rather than a Google redirect link.

## Tools

| Tool | What it does |
| --- | --- |
| `search_news` | Search for articles on any keyword, with a timeframe (`12h`, `7d`, `6m`), language and country. Supports Google operators such as quotes, `OR` and `site:`. |
| `top_stories` | The current top stories for a country and language, or the stories on a Google News topic page. |
| `get_article_text` | Fetch an article URL and return its readable body text, title, byline and publish time. |

Each article comes back as `{ position, title, link, source, sourceUrl, domain, datetime }`.

## Setup

Your MCP client starts the server itself, so there's nothing to keep running.

### Claude Desktop

Download [google-news.mcpb](https://github.com/lewisdonovan/google-news-scraper/releases/download/mcp-v0.2.0/google-news.mcpb) and double-click it, or drag it into **Settings → Extensions**. Claude Desktop installs it with its own Node.js, so you don't need Node installed.

### Claude Code

```bash
/plugin install google-news --marketplace lewisdonovan/google-news-scraper
```

Or add the server directly with `claude mcp add google-news -- npx -y google-news-scraper-mcp`.

### Cursor, Windsurf and most other clients

Requires Node.js 20.19 or later.

Add this to the client's MCP config (`.cursor/mcp.json`, `claude_desktop_config.json`, and so on):

```json
{
  "mcpServers": {
    "google-news": {
      "command": "npx",
      "args": ["-y", "google-news-scraper-mcp"]
    }
  }
}
```

### VS Code

```bash
code --add-mcp '{"name":"google-news","command":"npx","args":["-y","google-news-scraper-mcp"]}'
```

## Optional: a fallback when Google blocks you

Google rate-limits busy IPs, which is common on cloud servers. If you have a [SerpApi](https://serpapi.com/google-news-api) key, the server can fetch results through SerpApi's Google News API instead. Set these environment variables in your client's MCP config:

| Variable | What it does |
| --- | --- |
| `GOOGLE_NEWS_THIRD_PARTY_APIKEY` | Your SerpApi API key. Without it, only the free scraper is used. |
| `GOOGLE_NEWS_THIRD_PARTY_PRIMARY` | `true` (default) calls SerpApi first and scrapes only if it fails. `false` scrapes first and calls SerpApi only if Google can't be reached. |

```json
{
  "mcpServers": {
    "google-news": {
      "command": "npx",
      "args": ["-y", "google-news-scraper-mcp"],
      "env": { "GOOGLE_NEWS_THIRD_PARTY_APIKEY": "your-key", "GOOGLE_NEWS_THIRD_PARTY_PRIMARY": "false" }
    }
  }
}
```

In Claude Desktop, enter the key in the extension's settings instead. Each SerpApi call uses one of your SerpApi searches.

## Example prompts

* "What's the latest news on Nvidia from the past day?"
* "Summarise today's top stories in Germany, in English."
* "Find coverage of our product launch on techcrunch.com this month and read the most recent article."

## Notes

* Google rate-limits bursts of requests from one IP. The scraper retries with backoff, but very heavy use can still get temporarily blocked. A [third-party key](#optional-a-fallback-when-google-blocks-you) keeps results coming.
* `get_article_text` reads the page's HTML directly, so paywalled pages and sites that only render with JavaScript may return an error.

## Privacy

The server collects and stores nothing. It sends your queries to Google News, or to SerpApi if you set a key, and fetches the article pages you ask it to read. See the [privacy policy](PRIVACY.md).

## License

[MIT](LICENSE)
