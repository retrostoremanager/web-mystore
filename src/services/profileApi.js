import config from '../config';
import { fetchWithRetry } from '../utils/fetchWithRetry';

/**
 * Get company profile and locations.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: {profile, locations}}>}
 */
export async function getCompanyProfile(authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/company/profile`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve profile');
  }

  return result;
}

/**
 * Update company profile.
 * @param {Object} profile - Profile fields to update (partial)
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function updateCompanyProfile(profile, authHeaders) {
  const response = await fetch(`${config.apiUrl}/company/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(profile),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update profile');
  }

  return result;
}

/**
 * Create a location.
 * @param {Object} location - { name, address?, city?, state?, zipCode?, phone?, isPrimary? }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function createLocation(location, authHeaders) {
  const response = await fetch(`${config.apiUrl}/company/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(location),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create location');
  }

  return result;
}

/**
 * Update a location.
 * @param {number} id - Location ID
 * @param {Object} location - { name, address?, city?, state?, zipCode?, phone?, isPrimary? }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function updateLocation(id, location, authHeaders) {
  const response = await fetch(`${config.apiUrl}/company/locations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(location),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update location');
  }

  return result;
}

/**
 * Upload company logo (base64-encoded file).
 * @param {Object} payload - { file: base64string, fileName: string, contentType: string }
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: {profile}}>}
 */
export async function uploadLogo(payload, authHeaders) {
  const response = await fetch(`${config.apiUrl}/company/profile/logo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to upload logo');
  }

  return result;
}

/**
 * Delete company logo.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: {profile}}>}
 */
export async function deleteLogo(authHeaders) {
  const response = await fetch(`${config.apiUrl}/company/profile/logo`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to remove logo');
  }

  return result;
}

/**
 * Delete a location.
 * @param {number} id - Location ID
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteLocation(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/company/locations/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete location');
  }

  return result;
}
