import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

export async function getConsignmentItems(authHeaders, status) {
  const url = new URL(`${config.apiUrl}/consignment`, window.location.origin);
  if (status && status !== 'all') {
    url.searchParams.set('status', status);
  }
  const response = await fetchWithRetry(
    url.toString(),
    { method: 'GET', headers: authHeaders },
    3,
    1500
  );
  const result = await parseJsonResponse(response, 'Failed to retrieve consignment items');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve consignment items');
  }
  return result;
}

export async function createConsignmentItem(body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/consignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse(response, 'Failed to create consignment item');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create consignment item');
  }
  return result;
}

export async function markConsignmentSold(id, body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/consignment/${id}/sold`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse(response, 'Failed to mark consignment as sold');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to mark consignment as sold');
  }
  return result;
}

export async function recordConsignmentPayout(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/consignment/${id}/payout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });
  const result = await parseJsonResponse(response, 'Failed to record payout');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to record payout');
  }
  return result;
}

export async function returnConsignmentToCustomer(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/consignment/${id}/return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });
  const result = await parseJsonResponse(response, 'Failed to return consignment item');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to return consignment item');
  }
  return result;
}
