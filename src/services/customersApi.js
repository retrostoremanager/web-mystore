import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

/**
 * List customers for the current company.
 * @param {Object} authHeaders
 * @returns {Promise<{success: boolean, data?: Array}>}
 */
const normalizeCustomer = (c) => ({
  ...c,
  createdAt: c.createdAt ?? c.createdDate ?? null,
  pointsBalance: c.pointsBalance ?? null,
});

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
  if (Array.isArray(result.data)) {
    result.data = result.data.map(normalizeCustomer);
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

/**
 * Get a single customer by ID.
 * @param {number|string} customerId
 * @param {Object} authHeaders
 */
export async function getCustomer(customerId, authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/customers/${customerId}`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );
  const result = await parseJsonResponse(response, 'Failed to retrieve customer');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve customer');
  }
  if (result.data) {
    result.data = normalizeCustomer(result.data);
  }
  return result;
}

/**
 * Update a customer by ID.
 * @param {number|string} customerId
 * @param {Object} body
 * @param {Object} authHeaders
 */
export async function updateCustomer(customerId, body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/customers/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse(response, 'Failed to update customer');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to update customer');
  }
  return result;
}

/**
 * Delete a customer by ID.
 * @param {number|string} customerId
 * @param {Object} authHeaders
 */
export async function deleteCustomer(customerId, authHeaders) {
  const response = await fetch(`${config.apiUrl}/customers/${customerId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  const result = await parseJsonResponse(response, 'Failed to delete customer');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete customer');
  }
  return result;
}
