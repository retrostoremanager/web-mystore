import config from '../config';
import { fetchWithRetry, parseJsonResponse } from '../utils/fetchWithRetry';

export async function getTradeIns(authHeaders, status) {
  const url = new URL(`${config.apiUrl}/trade-ins`);
  if (status && status !== 'all') {
    url.searchParams.set('status', status);
  }
  const response = await fetchWithRetry(url.toString(), { method: 'GET', headers: authHeaders }, 3, 1500);
  const result = await parseJsonResponse(response, 'Failed to retrieve trade-ins');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to retrieve trade-ins');
  }
  return result;
}

export async function createTradeIn(body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/trade-ins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(body),
  });
  const result = await parseJsonResponse(response, 'Failed to create trade-in');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create trade-in');
  }
  return result;
}

export async function completeTradeIn(tradeInId, authHeaders) {
  const response = await fetch(`${config.apiUrl}/trade-ins/${tradeInId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
  });
  const result = await parseJsonResponse(response, 'Failed to complete trade-in');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to complete trade-in');
  }
  return result;
}

export async function rejectTradeIn(tradeInId, authHeaders) {
  const response = await fetch(`${config.apiUrl}/trade-ins/${tradeInId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
  });
  const result = await parseJsonResponse(response, 'Failed to reject trade-in');
  if (!response.ok) {
    throw new Error(result.message || 'Failed to reject trade-in');
  }
  return result;
}
