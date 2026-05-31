import config from '../config';

async function parseResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }
  return result;
}

export async function getPromotions(authHeaders) {
  const response = await fetch(`${config.apiUrl}/promotions`, {
    method: 'GET',
    headers: authHeaders,
  });
  return parseResponse(response, 'Failed to load promotions');
}

export async function createPromotion(body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(body),
  });
  return parseResponse(response, 'Failed to create promotion');
}

export async function updatePromotion(id, body, authHeaders) {
  const response = await fetch(`${config.apiUrl}/promotions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(body),
  });
  return parseResponse(response, 'Failed to update promotion');
}

export async function deletePromotion(id, authHeaders) {
  const response = await fetch(`${config.apiUrl}/promotions/${id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  return parseResponse(response, 'Failed to delete promotion');
}

export async function getActivePromotions(authHeaders) {
  const response = await fetch(`${config.apiUrl}/promotions/active`, {
    method: 'GET',
    headers: authHeaders,
  });
  return parseResponse(response, 'Failed to load active promotions');
}
