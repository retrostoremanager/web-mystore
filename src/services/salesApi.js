import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

async function parseSalesResponse(response, fallbackMessage) {
  const result = await parseJsonResponse(response, fallbackMessage);
  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }
  return result;
}

/**
 * Create a sale (checkout). Decrements inventory on the server.
 * @param {Object} body - { customerId, userId?, items: [{ inventoryItemId, quantity, unitPrice }], tax?, paymentMethod?, notes? }
 * @param {Object} authHeaders
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, errors?: string[] }>}
 */
export async function createSale(body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse(response, 'Failed to create sale');
  if (!response.ok) {
    const detail =
      (Array.isArray(result.errors) && result.errors.join('; ')) ||
      result.message ||
      'Failed to create sale';
    throw new Error(detail);
  }
  if (result.success === false) {
    const detail =
      (Array.isArray(result.errors) && result.errors.join('; ')) ||
      result.message ||
      'Failed to create sale';
    throw new Error(detail);
  }
  return result;
}

/**
 * List all sales for the company (newest first on the server).
 * @param {Object} authHeaders
 */
export async function getAllSales(authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/sales`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );
  return parseSalesResponse(response, 'Failed to retrieve sales');
}

/**
 * Sales between startDate and endDate (inclusive). Pass ISO 8601 strings.
 * @param {string} startDate
 * @param {string} endDate
 * @param {Object} authHeaders
 */
export async function getSalesByDateRange(startDate, endDate, authHeaders) {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  const response = await fetchWithRetry(
    `${config.apiUrl}/sales/date-range?${params.toString()}`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );
  return parseSalesResponse(response, 'Failed to retrieve sales for date range');
}
