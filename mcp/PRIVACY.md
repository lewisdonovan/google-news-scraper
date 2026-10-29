# Privacy policy

This policy covers the Google News MCP server (`google-news-scraper-mcp`), its Claude Desktop extension and its Claude Code plugin.

## What it collects

Nothing. The server has no accounts, analytics, telemetry or crash reporting, and the maintainer receives no data from it. If you give it an optional SerpApi API key, the key stays in your client's config on your machine and is only sent to SerpApi.

## What it stores

Nothing. It keeps no logs, cache, history or files. Each request is handled in memory and discarded when the response is returned.

## What it sends, and to whom

The server runs on your own machine. When your AI client calls one of its tools, it makes these requests directly from your machine:

| Tool | Request | Sent to |
| --- | --- | --- |
| `search_news` | Your search terms, timeframe, language and country | `news.google.com` |
| `top_stories` | Your language and country, or the topic URL you pass | `news.google.com`, or the host of that URL |
| `search_news`, `top_stories` | Article IDs, to resolve Google redirect links to publisher URLs | `news.google.com` |
| `get_article_text` | A request for the article page | The website that hosts the article URL |
| `search_news`, `top_stories`, only if you set a SerpApi key | Your search terms, timeframe, language and country or topic, and your SerpApi key | `serpapi.com` |

These are ordinary web requests, so the receiving sites see your IP address and a browser user agent, as they would if you visited them yourself. Their handling of that data is covered by their own policies, including [Google's privacy policy](https://policies.google.com/privacy) and, if you use it, SerpApi's privacy policy.

Results go back only to the AI client that called the tool. What that client does with them is covered by its own policy, for example [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy) for Claude.

## Contact

Questions about this policy: open an issue at https://github.com/lewisdonovan/google-news-scraper/issues.
