export interface RetryOptions {
    attempts?: number;
    baseDelayMs?: number;
    timeoutMs?: number;
}
declare const fetchWithRetry: (url: string, init?: RequestInit, { attempts, baseDelayMs, timeoutMs }?: RetryOptions) => Promise<Response>;
export default fetchWithRetry;
