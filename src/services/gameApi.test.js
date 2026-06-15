import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bulkLookupOffers, suggestedOfferForCondition } from './gameApi';

vi.mock('../config', () => ({
  default: { gameDbApiUrl: 'https://gamedb.test/api' },
}));

describe('gameApi offer engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bulkLookupOffers', () => {
    it('POSTs title/platform pairs and returns the results array', async () => {
      const mock = {
        baseMargin: 0.5,
        count: 1,
        results: [
          {
            title: 'Super Mario 64',
            matched: true,
            looseMarketCents: 1804,
            looseBuyCents: 902,
            completeMarketCents: 14300,
            completeBuyCents: 7150,
          },
        ],
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify(mock)),
      });

      const results = await bulkLookupOffers(
        [{ title: 'Super Mario 64', platform: 'Nintendo 64' }],
        0.5
      );

      expect(results).toEqual(mock.results);
      expect(fetch).toHaveBeenCalledWith(
        'https://gamedb.test/api/pricing/bulk-lookup?margin=0.5',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify([{ title: 'Super Mario 64', platform: 'Nintendo 64' }]),
        })
      );
    });

    it('drops blank-title rows and skips the call when nothing is priceable', async () => {
      global.fetch = vi.fn();
      const results = await bulkLookupOffers([{ title: '   ', platform: 'NES' }]);
      expect(results).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws the API message on a non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        text: () => Promise.resolve(JSON.stringify({ message: 'too many items' })),
      });
      await expect(
        bulkLookupOffers([{ title: 'X', platform: 'Y' }])
      ).rejects.toThrow('too many items');
    });
  });

  describe('suggestedOfferForCondition', () => {
    const priced = {
      matched: true,
      looseBuyCents: 1000, // $10 loose buy
      completeBuyCents: 2000, // $20 complete buy
    };

    it('returns the complete buy for excellent and a discounted value for poor', () => {
      expect(suggestedOfferForCondition(priced, 'excellent')).toBe(20);
      expect(suggestedOfferForCondition(priced, 'good')).toBe(17); // 20 * 0.85
      expect(suggestedOfferForCondition(priced, 'fair')).toBe(10); // loose
      expect(suggestedOfferForCondition(priced, 'poor')).toBe(7); // 10 * 0.7
    });

    it('derives the missing end when only one buy price is present', () => {
      const looseOnly = { matched: true, looseBuyCents: 1000 };
      // excellent uses complete ~= loose / 0.65
      expect(suggestedOfferForCondition(looseOnly, 'excellent')).toBeCloseTo(15.38, 1);
      expect(suggestedOfferForCondition(looseOnly, 'fair')).toBe(10);
    });

    it('returns null when unmatched or unpriced', () => {
      expect(suggestedOfferForCondition({ matched: false }, 'good')).toBeNull();
      expect(suggestedOfferForCondition({ matched: true }, 'good')).toBeNull();
      expect(suggestedOfferForCondition(null, 'good')).toBeNull();
    });
  });
});
