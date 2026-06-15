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
 * Change subscription tier (upgrade/downgrade).
 * Requires authentication.
 * @param {string} tier - Target tier: Basic, Premium, or Enterprise
 * @param {number} locationCount - Current location count (for downgrade validation)
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: {success, message, effectiveDate}, message?: string}>}
 */
export async function changeSubscriptionTier(tier, locationCount, authHeaders) {
  const response = await fetch(`${config.apiUrl}/billing/subscription/tier`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({ tier, locationCount }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to change subscription tier');
  }

  return result;
}

/**
 * Get subscription details for the current company.
 * Requires authentication.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function getSubscription(authHeaders) {
  const response = await fetch(`${config.apiUrl}/billing/subscription`, {
    method: 'GET',
    headers: authHeaders,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve subscription');
  }

  if (result.data) {
    const d = result.data;
    if (d.tier != null && d.plan == null) {
      d.plan = d.tier;
    }
    if (d.nextInvoiceAmount == null) {
      d.nextInvoiceAmount = null;
    }
    if (d.currency == null) {
      d.currency = 'usd';
    }
  }

  return result;
}

/**
 * Get invoices for the current company.
 * Requires authentication.
 * @param {Object} authHeaders - Headers from useAuth().getAuthHeaders()
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of invoices per page
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object}>}
 */
export async function getInvoices(authHeaders, page = 1, limit = 10) {
  const response = await fetch(
    `${config.apiUrl}/billing/invoices?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: authHeaders,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve invoices');
  }

  if (result.data && !Array.isArray(result.data) && Array.isArray(result.data.invoices)) {
    const { invoices, hasMore, ...rest } = result.data;
    return {
      ...result,
      data: invoices,
      hasMore: hasMore ?? false,
      pagination: { ...rest, totalPages: hasMore ? page + 1 : page },
    };
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
