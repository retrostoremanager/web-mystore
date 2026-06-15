import config from '../config';

/**
 * Fetches the current user's permissions.
 * @param {Object} headers - Auth headers (e.g. from getAuthHeaders())
 * @returns {Promise<{data?: string[], success: boolean, message?: string}>}
 */
export const getPermissions = async (headers) => {
  const response = await fetch(`${config.apiUrl}/permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { success: false, data: [], message: data.message || 'Failed to load permissions' };
  }
  return { success: true, data: data.data || [] };
};
