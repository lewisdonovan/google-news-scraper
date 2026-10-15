import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchNews, topStories, extractArticle, getArticleText } from '../src/tools.js';

const article = {
  title: 'Headline', link: 'https://example.com/a', image: '', source: 'Example',
  sourceUrl: 'https://example.com', datetime: '2026-10-14T09:00:00.000Z', time: '3 hours ago', articleType: 'regular',
};

const recordingScraper = () => {
  const calls = [];
  const scrape = async config => { calls.push(config); return [article]; };
  return { calls, scrape };
};

test('searchNews passes the query, timeframe and locale to the scraper and trims fields', async () => {
  const { calls, scrape } = recordingScraper();
  const results = await searchNews({ query: 'OpenAI', timeframe: '1d', language: 'en-GB', country: 'gb', limit: 5 }, scrape);
  assert.deepEqual(calls[0], {
    logLevel: 'none', searchTerm: 'OpenAI', timeframe: '1d', limit: 5, queryVars: { hl: 'en-GB', gl: 'GB' },
  });
  assert.deepEqual(results, [{
    title: 'Headline', link: 'https://example.com/a', source: 'Example',
    sourceUrl: 'https://example.com', datetime: '2026-10-14T09:00:00.000Z',
  }]);
});

test('searchNews defaults to the past week and 20 results', async () => {
  const { calls, scrape } = recordingScraper();
  await searchNews({ query: 'x' }, scrape);
  assert.equal(calls[0].timeframe, '7d');
  assert.equal(calls[0].limit, 20);
  assert.deepEqual(calls[0].queryVars, {});
});

test('topStories reads the front page unless a topic URL is given', async () => {
  const { calls, scrape } = recordingScraper();
  await topStories({}, scrape);
  await topStories({ topicUrl: 'https://news.google.com/topics/ABC' }, scrape);
  assert.equal(calls[0].baseUrl, undefined);
  assert.equal(calls[0].searchTerm, undefined);
  assert.equal(calls[1].baseUrl, 'https://news.google.com/topics/ABC');
});

const page = `<!doctype html><html><head><title>Rates rise</title></head><body>
  <nav>Home | World</nav>
  <article><h1>Rates rise</h1><p class="byline">By Jo Smith</p>
  ${'<p>The central bank raised interest rates again on Tuesday, citing persistent inflation across the economy.</p>'.repeat(8)}
  </article></body></html>`;

test('extractArticle returns the readable body text', () => {
  const result = extractArticle(page, 'https://example.com/rates');
  assert.equal(result.url, 'https://example.com/rates');
  assert.match(result.text, /central bank raised interest rates/);
  assert.doesNotMatch(result.text, /Home \| World/);
  assert.equal(result.truncated, false);
});

test('getArticleText reports HTTP errors and unreadable pages', async () => {
  const respond = (status, body) => async () => ({ ok: status < 400, status, url: '', text: async () => body });
  await assert.rejects(getArticleText({ url: 'https://example.com' }, respond(403, '')), /HTTP 403/);
  await assert.rejects(getArticleText({ url: 'https://example.com' }, respond(200, '<html><body></body></html>')), /No readable article text/);
  const ok = await getArticleText({ url: 'https://example.com/rates' }, respond(200, page));
  assert.match(ok.text, /central bank/);
});
