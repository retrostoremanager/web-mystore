import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPromotion, updatePromotion } from './promotionsApi';

vi.mock('../config', () => ({
  default: { apiUrl: 'https://api.test' },
}));

describe('promotionsApi validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });
  });

  describe('createPromotion', () => {
    it('throws when bxgy type has no buyQuantity', async () => {
      const body = { name: 'Bad BXGY', type: 'bxgy', scope: 'store_wide', isActive: true };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'buyQuantity must be at least 1 for bxgy promotions'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when bxgy type has buyQuantity but no getQuantity', async () => {
      const body = { name: 'Bad BXGY', type: 'bxgy', scope: 'store_wide', buyQuantity: 2, isActive: true };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'getQuantity must be at least 1 for bxgy promotions'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when bxgy type has buyQuantity < 1', async () => {
      const body = { name: 'Bad BXGY', type: 'bxgy', scope: 'store_wide', buyQuantity: 0, getQuantity: 1 };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'buyQuantity must be at least 1 for bxgy promotions'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when scope is category but scopeValue is missing', async () => {
      const body = { name: 'No ScopeVal', type: 'percentage', scope: 'category', discountPercent: 10, isActive: true };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'scopeValue is required when scope is category or item'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when scope is item but scopeValue is empty string', async () => {
      const body = { name: 'No ScopeVal', type: 'percentage', scope: 'item', scopeValue: '  ', discountPercent: 10 };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'scopeValue is required when scope is category or item'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when discountPercent is greater than 100', async () => {
      const body = { name: 'Too High', type: 'percentage', scope: 'store_wide', discountPercent: 150, isActive: true };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'discountPercent must be between 0 and 100'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when discountPercent is negative', async () => {
      const body = { name: 'Negative', type: 'percentage', scope: 'store_wide', discountPercent: -5 };
      await expect(createPromotion(body, {})).rejects.toThrow(
        'discountPercent must be between 0 and 100'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('sends request when valid percentage promotion', async () => {
      const body = { name: 'Valid', type: 'percentage', scope: 'store_wide', discountPercent: 10, isActive: true };
      await createPromotion(body, { Authorization: 'Bearer token' });
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test/promotions',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('sends request when valid bxgy promotion', async () => {
      const body = { name: 'Valid BXGY', type: 'bxgy', scope: 'store_wide', buyQuantity: 2, getQuantity: 1, isActive: true };
      await createPromotion(body, {});
      expect(fetch).toHaveBeenCalled();
    });

    it('sends request when valid category-scoped promotion with scopeValue', async () => {
      const body = { name: 'Cat Promo', type: 'percentage', scope: 'category', scopeValue: 'Games', discountPercent: 15 };
      await createPromotion(body, {});
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('updatePromotion', () => {
    it('throws when bxgy type has no buyQuantity', async () => {
      const body = { type: 'bxgy', scope: 'store_wide', getQuantity: 1 };
      await expect(updatePromotion(1, body, {})).rejects.toThrow(
        'buyQuantity must be at least 1 for bxgy promotions'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when discountPercent > 100 on update', async () => {
      const body = { type: 'percentage', scope: 'store_wide', discountPercent: 110 };
      await expect(updatePromotion(1, body, {})).rejects.toThrow(
        'discountPercent must be between 0 and 100'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws when category scope has no scopeValue on update', async () => {
      const body = { type: 'percentage', scope: 'category', discountPercent: 10 };
      await expect(updatePromotion(1, body, {})).rejects.toThrow(
        'scopeValue is required when scope is category or item'
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('sends request when valid update payload', async () => {
      const body = { isActive: false };
      await updatePromotion(5, body, {});
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test/promotions/5',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });
});
