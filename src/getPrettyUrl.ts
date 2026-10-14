import winston from "winston";

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
const TIMEOUT_MS = 15000;

export const getArticleId = (googleUrl: string): string | null => {
  const match = googleUrl.match(/\/(?:rss\/)?(?:articles|read)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// Older article ids embed the publisher URL directly in their base64 payload
export const decodeLegacyId = (id: string): string | null => {
  const decoded = Buffer.from(id, 'base64').toString('latin1');
  if (decoded.includes('AU_yqL')) return null;
  const match = decoded.match(/https?:\/\/[\x21-\x7e]+/);
  return match ? match[0] : null;
}

// Newer ids are opaque: Google resolves them through its own batchexecute endpoint,
// which needs a signature and timestamp scraped from the article's redirect page
const decodeWithGoogle = async (id: string): Promise<string | null> => {
  const page = await fetch(`https://news.google.com/rss/articles/${id}`, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const html = await page.text();
  const signature = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
  const timestamp = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
  if (!signature || !timestamp) return null;

  const payload = JSON.stringify([
    'garturlreq',
    [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
    id, Number(timestamp), signature,
  ]);
  const response = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': USER_AGENT },
    body: 'f.req=' + encodeURIComponent(JSON.stringify([[['Fbv4je', payload, null, 'generic']]])),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  const json = JSON.parse(text.slice(text.indexOf('[')));
  const result = JSON.parse(json[0][2]);
  return typeof result?.[1] === 'string' ? result[1] : null;
}

const getPrettyUrl = async (googleUrl: string, logger: winston.Logger): Promise<string | null> => {
  const id = getArticleId(googleUrl);
  if (!id) return null;
  try {
    return decodeLegacyId(id) ?? await decodeWithGoogle(id);
  } catch (error) {
    logger.warn(`Could not resolve publisher URL for ${googleUrl}: ${error}`);
    return null;
  }
}

export default getPrettyUrl;
