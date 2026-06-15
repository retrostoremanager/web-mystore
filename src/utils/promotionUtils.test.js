import { describe, it, expect } from 'vitest';
import { applyPromotions, calculateSavings } from './promotionUtils';

const makeItem = (overrides = {}) => ({
  id: 1,
  name: 'Test Item',
  sellPrice: 10,
  quantity: 1,
  category: 'Games',
  ...overrides,
});

const pctPromo = (overrides = {}) => ({
  id: 'p1',
  name: 'Summer Sale',
  type: 'percentage',
  scope: 'store_wide',
  discountPercent: 15,
  ...overrides,
});

const bxgyPromo = (overrides = {}) => ({
  id: 'p2',
  name: 'Buy 2 Get 1 Free',
  type: 'bxgy',
  scope: 'store_wide',
  buyQuantity: 2,
  getQuantity: 1,
  ...overrides,
});

describe('applyPromotions', () => {
  it('returns original items when promotions list is empty', () => {
    const items = [makeItem()];
    expect(applyPromotions(items, [])).toEqual(items);
  });

  it('returns original items when cart is empty', () => {
    expect(applyPromotions([], [pctPromo()])).toEqual([]);
  });

  it('applies percentage discount to store_wide promotion', () => {
    const items = [makeItem({ sellPrice: 20, quantity: 1 })];
    const result = applyPromotions(items, [pctPromo({ discountPercent: 10 })]);
    expect(result[0].discountedPrice).toBeCloseTo(18);
    expect(result[0].originalPrice).toBe(20);
    expect(result[0].discountApplied).toBe(true);
  });

  it('applies percentage discount with category scope — matching item', () => {
    const items = [makeItem({ category: 'Games', sellPrice: 10 })];
    const promo = pctPromo({ scope: 'category', scopeValue: 'Games', discountPercent: 20 });
    const result = applyPromotions(items, [promo]);
    expect(result[0].discountedPrice).toBeCloseTo(8);
  });

  it('does not apply percentage discount to non-matching category', () => {
    const items = [makeItem({ category: 'Accessories', sellPrice: 10 })];
    const promo = pctPromo({ scope: 'category', scopeValue: 'Games', discountPercent: 20 });
    const result = applyPromotions(items, [promo]);
    expect(result[0].discountedPrice).toBeUndefined();
  });

  it('applies percentage discount with item scope by id', () => {
    const items = [makeItem({ id: 42, sellPrice: 50 })];
    const promo = pctPromo({ scope: 'item', scopeValue: '42', discountPercent: 50 });
    const result = applyPromotions(items, [promo]);
    expect(result[0].discountedPrice).toBeCloseTo(25);
  });

  it('does not apply item-scope discount to non-matching item', () => {
    const items = [makeItem({ id: 99, sellPrice: 50 })];
    const promo = pctPromo({ scope: 'item', scopeValue: '42', discountPercent: 50 });
    const result = applyPromotions(items, [promo]);
    expect(result[0].discountedPrice).toBeUndefined();
  });

  it('applies BXGY — marks free units and reduces lineTotal', () => {
    const items = [makeItem({ sellPrice: 10, quantity: 3 })];
    const result = applyPromotions(items, [bxgyPromo()]);
    expect(result[0].bxgyFreeUnits).toBe(1);
    expect(result[0].lineTotal).toBeCloseTo(20);
    expect(result[0].discountApplied).toBe(true);
  });

  it('BXGY does not apply when not enough items to trigger', () => {
    const items = [makeItem({ sellPrice: 10, quantity: 2 })];
    const result = applyPromotions(items, [bxgyPromo()]);
    expect(result[0].bxgyFreeUnits).toBeUndefined();
  });

  it('BXGY applies across multiple items in scope', () => {
    const items = [
      makeItem({ id: 1, sellPrice: 10, quantity: 2 }),
      makeItem({ id: 2, sellPrice: 10, quantity: 1 }),
    ];
    const result = applyPromotions(items, [bxgyPromo()]);
    const totalFree = (result[0].bxgyFreeUnits || 0) + (result[1].bxgyFreeUnits || 0);
    expect(totalFree).toBe(1);
  });

  it('BXGY filters by category scope — non-matching items not discounted', () => {
    const items = [
      makeItem({ id: 1, category: 'Games', sellPrice: 10, quantity: 3 }),
      makeItem({ id: 2, category: 'Accessories', sellPrice: 20, quantity: 3 }),
    ];
    const promo = bxgyPromo({ scope: 'category', scopeValue: 'Games' });
    const result = applyPromotions(items, [promo]);
    expect(result[0].bxgyFreeUnits).toBe(1);
    expect(result[1].bxgyFreeUnits).toBeUndefined();
  });

  it('applies multiple promotions in sequence', () => {
    const items = [makeItem({ sellPrice: 100, quantity: 3 })];
    const promos = [
      pctPromo({ discountPercent: 10 }),
      bxgyPromo({ buyQuantity: 2, getQuantity: 1 }),
    ];
    const result = applyPromotions(items, promos);
    expect(result[0].discountApplied).toBe(true);
    expect(result[0].bxgyFreeUnits).toBe(1);
  });

  it('handles snake_case field names on promotion (backend compat)', () => {
    const items = [makeItem({ sellPrice: 50, quantity: 1 })];
    const promo = {
      id: 'p3',
      name: 'Sale',
      type: 'percentage',
      scope: 'store_wide',
      discount_percent: 25,
    };
    const result = applyPromotions(items, [promo]);
    expect(result[0].discountedPrice).toBeCloseTo(37.5);
  });
});

describe('calculateSavings', () => {
  it('returns 0 when no discounts applied', () => {
    const items = [makeItem({ sellPrice: 10, quantity: 2 })];
    expect(calculateSavings(items, items)).toBe(0);
  });

  it('calculates savings from percentage discount', () => {
    const original = [makeItem({ sellPrice: 20, quantity: 1 })];
    const discounted = [{ ...original[0], discountedPrice: 17, discountApplied: true }];
    expect(calculateSavings(original, discounted)).toBeCloseTo(3);
  });

  it('calculates savings from BXGY lineTotal', () => {
    const original = [makeItem({ sellPrice: 10, quantity: 3 })];
    const discounted = [{ ...original[0], lineTotal: 20, bxgyFreeUnits: 1, discountApplied: true }];
    expect(calculateSavings(original, discounted)).toBeCloseTo(10);
  });
});
