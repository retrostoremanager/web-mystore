/**
 * Fetch with retry for network errors (e.g. ERR_CONNECTION_REFUSED).
 * Retries up to maxRetries times with delayMs between attempts.
 * Only retries on network/connection failures, not on HTTP 4xx/5xx.
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3, delayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      lastError = err;
      const isNetworkError =
        err instanceof TypeError ||
        err.message?.includes('fetch') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError');
      if (!isNetworkError || attempt === maxRetries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw lastError;
}

/**
 * Safely parse JSON from a fetch response. Handles empty or invalid bodies.
 * @param {Response} response - Fetch response
 * @param {string} fallbackError - Error message when body is empty/invalid
 * @returns {Promise<Object>}
 */
export async function parseJsonResponse(response, fallbackError) {
  const text = await response.text();
  if (!text || text.trim() === '') {
    throw new Error(
      response.ok
        ? `${fallbackError} (empty response)`
        : `${fallbackError} (${response.status} ${response.statusText})`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `${fallbackError} (invalid response: ${text.substring(0, 80)}${text.length > 80 ? '…' : ''})`
    );
  }
}
