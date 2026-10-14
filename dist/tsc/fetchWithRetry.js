var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Google intermittently answers with 503/429 when an IP sends a burst of requests,
// so transient failures are retried with exponential backoff before giving up
const fetchWithRetry = (url_1, ...args_1) => __awaiter(void 0, [url_1, ...args_1], void 0, function* (url, init = {}, { attempts = 3, baseDelayMs = 1000, timeoutMs = 30000 } = {}) {
    var _a, _b;
    for (let attempt = 1;; attempt++) {
        const isLast = attempt >= attempts;
        try {
            const response = yield fetch(url, Object.assign(Object.assign({}, init), { signal: AbortSignal.timeout(timeoutMs) }));
            if (isLast || !RETRYABLE_STATUSES.includes(response.status))
                return response;
            const retryAfter = Number((_b = (_a = response.headers) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, 'retry-after'));
            yield sleep(retryAfter > 0 ? Math.min(retryAfter * 1000, 10000) : baseDelayMs * Math.pow(2, (attempt - 1)));
        }
        catch (error) {
            if (isLast)
                throw error;
            yield sleep(baseDelayMs * Math.pow(2, (attempt - 1)));
        }
    }
});
export default fetchWithRetry;
