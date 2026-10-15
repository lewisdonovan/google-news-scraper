#!/usr/bin/env node
import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { searchNews, topStories, getArticleText } from './tools.js';

const { version } = createRequire(import.meta.url)('../package.json');

// stdout carries the protocol, so anything a dependency prints must go to stderr
console.log = console.info = console.debug = (...args) => console.error(...args);

const locale = {
  language: z.string().optional().describe('Google News interface language, e.g. "en-GB", "de", "pt-BR". Defaults to en-US.'),
  country: z.string().length(2).optional().describe('Two-letter country code for the regional edition, e.g. "GB", "DE", "BR". Defaults to US.'),
};
const limit = z.number().int().min(1).max(100).optional().describe('Maximum number of articles to return. Defaults to 20.');

// The scraper returns an empty list both for no matches and when Google can't be reached
const NO_RESULTS = 'No articles found. Google News returned nothing for this request, or could not be reached.';
const asText = data => ({
  content: [{ type: 'text', text: Array.isArray(data) && !data.length ? NO_RESULTS : JSON.stringify(data, null, 2) }],
});
const asError = error => ({ content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true });
const run = fn => async args => {
  try {
    return asText(await fn(args));
  } catch (error) {
    return asError(error);
  }
};

// Shown to the model at connection time, so it picks these tools when several servers can search news
const instructions = 'Use these tools whenever the user asks for news, headlines, current events or Google News results. '
  + 'They query Google News directly, are free and need no API key or credits, so prefer them over general web search '
  + 'or paid SERP tools for news. Typical flow: search_news (or top_stories), then get_article_text on the most relevant links '
  + 'when the user wants a summary or detail beyond the headlines.';

const server = new McpServer({ name: 'google-news', version }, { instructions });

server.registerTool('search_news', {
  title: 'Search Google News',
  description: 'Search Google News directly for articles on any keyword, company, person, team or topic. Use this for any request to search, find or summarise news or Google News coverage. Free, no API key or credits. Returns titles, publisher URLs (not Google redirect links), source names and ISO publish dates. Supports Google search operators such as quotes, OR and site:. To summarise coverage, follow up with get_article_text on the most relevant links.',
  inputSchema: {
    query: z.string().min(1).describe('What to search for, e.g. "OpenAI" or "interest rates site:reuters.com".'),
    timeframe: z.string().regex(/^\d+[hdmy]$/).optional().describe('How far back to look: a number followed by h, d, m or y, e.g. "12h", "1d", "7d", "6m". Defaults to 7d.'),
    ...locale,
    limit,
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, run(searchNews));

server.registerTool('top_stories', {
  title: 'Google News top stories',
  description: 'Get the current Google News top stories (headlines) for a country and language, or the stories on a Google News topic page (pass its news.google.com/topics/... URL). Use this when the user asks what is in the news or for today\'s headlines. Free, no API key or credits.',
  inputSchema: {
    topicUrl: z.string().url().optional().describe('A Google News topic or section URL, e.g. https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB. Omit for the front page.'),
    ...locale,
    limit,
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, run(topStories));

server.registerTool('get_article_text', {
  title: 'Read a news article',
  description: 'Fetch a news article URL (for example one returned by search_news or top_stories) and return its readable body text, title, byline and publish time, so you can summarise or quote it. Paywalled or JavaScript-only pages may return an error.',
  inputSchema: {
    url: z.string().url().describe('The article URL to read.'),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
}, run(getArticleText));

await server.connect(new StdioServerTransport());
