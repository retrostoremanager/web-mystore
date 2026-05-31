import config from '../config';

async function parseResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }
  return result;
}

function validatePromotionPayload(body) {
  if (body.type === 'bxgy') {
    if (body.buyQuantity == null || body.buyQuantity < 1) {
      throw new Error('buyQuantity must be at least 1 for bxgy promotions');
    }
    if (body.getQuantity == null || body.getQuantity < 1) {
      throw new Error('getQuantity must be at least 1 for bxgy promotions');
    }
  }
  if (body.scope === 'category' || body.scope === 'item') {
    if (body.scopeValue == null || String(body.scopeValue).trim() === '') {
      throw new Error('scopeValue is required when scope is category or item');
    }
  }
  if (body.type === 'percentage') {
    if (body.discountPercent == null || body.discountPercent < 0 || body.discountPercent > 100) {
      throw new Error('discountPercent must be between 0 and 100');
    }
  }
}

export async function getPromotions(authHeaders) {
  const response = await fetch(`${config.apiUrl}/promotions`, {
    method: 'GET',
    headers: authHeaders,
  });
  return parseResponse(response, 'Failed to load promotions');
}

export async function createPromotion(body, authHeaders) {
  validatePromotionPayload(body);
  const response = await fetch(`${config.apiUrl}/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(body),
  });
  return parseResponse(response, 'Failed to create promotion');
}

export async function updatePromotion(id, body, authHeaders) {
  validatePromotionPayload(body);
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
