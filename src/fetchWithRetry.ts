const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Google intermittently answers with 503/429 when an IP sends a burst of requests,
// so transient failures are retried with exponential backoff before giving up
const fetchWithRetry = async (
  url: string,
  init: RequestInit = {},
  { attempts = 3, baseDelayMs = 1000, timeoutMs = 30000 }: RetryOptions = {}
): Promise<Response> => {
  for (let attempt = 1; ; attempt++) {
    const isLast = attempt >= attempts;
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (isLast || !RETRYABLE_STATUSES.includes(response.status)) return response;
      const retryAfter = Number(response.headers?.get?.('retry-after'));
      await sleep(retryAfter > 0 ? Math.min(retryAfter * 1000, 10000) : baseDelayMs * 2 ** (attempt - 1));
    } catch (error) {
      if (isLast) throw error;
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
}

export default fetchWithRetry;
