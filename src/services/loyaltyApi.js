import config from '../config';

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
