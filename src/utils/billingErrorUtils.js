/**
 * Maps error types to user-friendly messages for billing operations.
 * Network errors and API errors are handled to provide clear guidance.
 */

/**
 * Check if an error is a network/connection error.
 * @param {Error} err
 * @returns {boolean}
 */
export function isNetworkError(err) {
  if (!err || !err.message) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('networkrequestfailed') ||
    msg.includes('load failed') ||
    msg.includes('connection') ||
    err.name === 'TypeError'
  );
}

/**
 * Get user-friendly error message for billing operations.
 * API already returns user-friendly messages; this handles edge cases.
 * @param {Error} err
 * @returns {{ message: string, isRetryable: boolean }}
 */
export function getBillingErrorMessage(err) {
  if (!err) {
    return { message: 'An unexpected error occurred.', isRetryable: false };
  }

  if (isNetworkError(err)) {
    return {
      message: "We couldn't connect. Please check your internet connection and try again.",
      isRetryable: true,
    };
  }

  return {
    message: err.message || 'An unexpected error occurred. Please try again.',
    isRetryable: false,
  };
}
