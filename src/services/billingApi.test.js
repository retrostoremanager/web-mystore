import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTrialStatus } from './billingApi';

vi.mock('../config', () => ({
  default: { apiUrl: 'https://api.test' },
}));

describe('billingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTrialStatus', () => {
    it('returns trial status when API succeeds', async () => {
      const mockData = {
        success: true,
        data: {
          isInTrial: true,
          trialStartDate: '2025-01-01T00:00:00Z',
          trialEndDate: '2025-01-31T00:00:00Z',
          daysRemaining: 15,
          hasPaymentMethod: true,
          subscriptionTier: 'Trial',
        },
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await getTrialStatus({ Authorization: 'Bearer token' });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test/billing/trial-status',
        expect.objectContaining({
          method: 'GET',
          headers: { Authorization: 'Bearer token' },
        })
      );
    });

    it('throws with message when API returns error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Company not found' }),
      });

      await expect(getTrialStatus({})).rejects.toThrow('Company not found');
    });

    it('throws generic message when API returns error without message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(getTrialStatus({})).rejects.toThrow('Failed to retrieve trial status');
    });
  });
});
