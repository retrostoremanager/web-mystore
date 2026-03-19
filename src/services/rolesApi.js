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

/**
 * Get all available permissions (for creating/editing custom roles).
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Array<{id: number, name: string, description?: string}>}>}
 */
export async function getAvailablePermissions(authHeaders) {
  const response = await fetch(
    `${config.apiUrl}/permissions/available`,
    { method: 'GET', headers: authHeaders }
  );

  const result = await parseJsonResponse(response, 'Failed to retrieve permissions');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve permissions');
  }

  return result;
}

/**
 * Create a custom role.
 * @param {Object} role - { name, description?, permissions: string[] }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function createRole(role, authHeaders) {
  const response = await fetch(`${config.apiUrl}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(role),
  });

  const result = await parseJsonResponse(response, 'Failed to create role');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create role');
  }

  return result;
}

/**
 * Update a custom role.
 * @param {number} id - Role ID
 * @param {Object} role - { name?, description?, permissions?: string[] }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function updateRole(id, role, authHeaders) {
  const response = await fetch(`${config.apiUrl}/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(role),
  });

  const result = await parseJsonResponse(response, 'Failed to update role');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update role');
  }

  return result;
}

/**
 * Delete a custom role.
 * @param {number} id - Role ID
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteRole(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/roles/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  const result = await parseJsonResponse(response, 'Failed to delete role');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete role');
  }

  return result;
}
