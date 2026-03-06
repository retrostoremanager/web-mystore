import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

/**
 * Get all roles for the current company (system + company-specific).
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Array}>}
 */
export async function getRoles(authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/roles`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );

  const result = await parseJsonResponse(response, 'Failed to retrieve roles');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve roles');
  }

  return result;
}

/**
 * Get a role by ID.
 * @param {number} id - Role ID
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function getRoleById(id, authHeaders) {
  const response = await fetch(
    `${config.apiUrl}/roles/${id}`,
    { method: 'GET', headers: authHeaders }
  );

  const result = await parseJsonResponse(response, 'Failed to retrieve role');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve role');
  }

  return result;
}
