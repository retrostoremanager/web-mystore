import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

/**
 * Get all users for the current company.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Array}>}
 */
export async function getUsers(authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/users`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );

  const result = await parseJsonResponse(response, 'Failed to retrieve users');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve users');
  }

  return result;
}

/**
 * Create a new user.
 * @param {Object} user - { firstName, lastName, email, phone?, roleIds? }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function createUser(user, authHeaders) {
  const response = await fetch(`${config.apiUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(user),
  });

  const result = await parseJsonResponse(response, 'Failed to create user');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create user');
  }

  return result;
}

/**
 * Update an existing user.
 * @param {number} id - User ID
 * @param {Object} user - { firstName?, lastName?, email?, phone?, roleIds?, isActive? }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function updateUser(id, user, authHeaders) {
  const response = await fetch(`${config.apiUrl}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(user),
  });

  const result = await parseJsonResponse(response, 'Failed to update user');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update user');
  }

  return result;
}

/**
 * Resend invite email for a user with pending_invitation status.
 * @param {number} id - User ID
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function resendInvite(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/users/${id}/resend-invite`, {
    method: 'POST',
    headers: authHeaders,
  });

  const result = await parseJsonResponse(response, 'Failed to resend invite');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to resend invite');
  }

  return result;
}

/**
 * Delete a user.
 * @param {number} id - User ID
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteUser(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  const result = await parseJsonResponse(response, 'Failed to delete user');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete user');
  }

  return result;
}

/**
 * Search users by query.
 * @param {string} query - Search query
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Array}>}
 */
export async function searchUsers(query, authHeaders) {
  const response = await fetch(
    `${config.apiUrl}/users/search?q=${encodeURIComponent(query)}`,
    { method: 'GET', headers: authHeaders }
  );

  const result = await parseJsonResponse(response, 'Failed to search users');

  if (!response.ok) {
    throw new Error(result.message || 'Failed to search users');
  }

  return result;
}
