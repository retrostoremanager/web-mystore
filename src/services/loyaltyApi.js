import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

/**
 * Get loyalty transaction history and balance for a customer.
 * @param {number|string} customerId
 * @param {Object} authHeaders
 * @returns {Promise<{success: boolean, data?: {balance: number, transactions: Array}}>}
 */
export async function getCustomerLoyalty(customerId, authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/customers/${customerId}/loyalty`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );
  const result = await parseJsonResponse(response, 'Failed to retrieve loyalty data');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve loyalty data');
  }
  return result;
}

/**
 * Redeem points for a customer.
 * @param {number|string} customerId
 * @param {number} points - Number of points to redeem
 * @param {Object} authHeaders
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function redeemLoyaltyPoints(customerId, points, authHeaders) {
  const response = await fetch(`${config.apiUrl}/customers/${customerId}/loyalty/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({ points }),
  });
  const result = await parseJsonResponse(response, 'Failed to redeem points');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to redeem points');
  }
  return result;
}

/**
 * Get loyalty program settings.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: {enabled, purchasePointsPerDollar, tradeInPointsPerDollar, redemptionRate}}>}
 */
export async function getLoyaltySettings(authHeaders) {
  const response = await fetch(`${config.apiUrl}/loyalty/settings`, {
    method: 'GET',
    headers: authHeaders,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve loyalty settings');
  }

  return result;
}

/**
 * Update loyalty program settings.
 * @param {Object} payload - { enabled, purchasePointsPerDollar, tradeInPointsPerDollar, redemptionRate }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function updateLoyaltySettings(payload, authHeaders) {
  const response = await fetch(`${config.apiUrl}/loyalty/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update loyalty settings');
  }

  return result;
}
