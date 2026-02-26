import config from '../config';

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
