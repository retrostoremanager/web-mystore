import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

/**
 * List customers for the current company.
 * @param {Object} authHeaders
 * @returns {Promise<{success: boolean, data?: Array}>}
 */
export async function getCustomers(authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/customers`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );
  const result = await parseJsonResponse(response, 'Failed to retrieve customers');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve customers');
  }
  return result;
}

/**
 * Create a customer. API expects firstName/lastName; UI typically sends display name in firstName.
 * @param {Object} body - { firstName, lastName?, email?, phone?, address?, city?, state?, zipCode? }
 * @param {Object} authHeaders
 */
export async function createCustomer(body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse(response, 'Failed to create customer');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create customer');
  }
  return result;
}
