import config from '../config';
import { fetchWithRetry } from '../utils/fetchWithRetry';

/**
 * Store a payment method (Stripe payment method ID from frontend).
 * Requires authentication.
 * @param {string} paymentMethodId - Stripe payment method ID from stripe.createPaymentMethod
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export async function storePaymentMethod(paymentMethodId, authHeaders) {
  const response = await fetch(`${config.apiUrl}/billing/payment-methods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({ paymentMethodId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to store payment method');
  }

  return result;
}

/**
 * Get trial status for the current company.
 * Requires authentication.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: {isInTrial, trialStartDate, trialEndDate, daysRemaining, hasPaymentMethod, subscriptionTier}}>}
 */
export async function getTrialStatus(authHeaders) {
  const response = await fetchWithRetry(
    `${config.apiUrl}/billing/trial-status`,
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve trial status');
  }

  return result;
}

/**
 * Get payment methods for the current company.
 * Requires authentication.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Array}>}
 */
export async function getPaymentMethods(authHeaders) {
  const response = await fetch(`${config.apiUrl}/billing/payment-methods`, {
    method: 'GET',
    headers: authHeaders,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve payment methods');
  }

  return result;
}

/**
 * Set a payment method as the default for the company.
 * Requires authentication.
 * @param {number} paymentMethodId - Database ID of the payment method
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export async function setDefaultPaymentMethod(paymentMethodId, authHeaders) {
  const response = await fetch(
    `${config.apiUrl}/billing/payment-methods/${paymentMethodId}/default`,
    {
      method: 'PATCH',
      headers: authHeaders,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to set default payment method');
  }

  return result;
}

/**
 * Delete a payment method.
 * Requires authentication. Cannot delete the last payment method.
 * @param {number} paymentMethodId - Database ID of the payment method
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deletePaymentMethod(paymentMethodId, authHeaders) {
  const response = await fetch(
    `${config.apiUrl}/billing/payment-methods/${paymentMethodId}`,
    {
      method: 'DELETE',
      headers: authHeaders,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete payment method');
  }

  return result;
}
