import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseTradeInImage } from './tradeInApi';

vi.mock('../config', () => ({
  default: { apiUrl: 'https://api.test' },
}));

describe('tradeInApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseTradeInImage', () => {
    it('returns parsed items when API succeeds', async () => {
      const mockData = {
        success: true,
        data: {
          items: [
            { gameTitle: 'Super Mario Bros', platform: 'NES', condition: 'good', offeredValue: null },
          ],
        },
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      });

      const result = await parseTradeInImage('base64data', 'image/png', {
        Authorization: 'Bearer token',
        'x-company-id': '13',
      });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test/trade-ins/parse-image',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          }),
          body: JSON.stringify({ imageBase64: 'base64data', mimeType: 'image/png' }),
        })
      );
    });

    it('throws with message when API returns error with message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve(JSON.stringify({ message: 'AI service unavailable' })),
      });

      await expect(
        parseTradeInImage('base64data', 'image/png', {})
      ).rejects.toThrow('AI service unavailable');
    });

    it('throws generic message when API returns error without message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve(JSON.stringify({})),
      });

      await expect(
        parseTradeInImage('base64data', 'image/png', {})
      ).rejects.toThrow('Failed to parse image');
    });

    it('throws with status when API returns empty body (e.g. 404 endpoint not found)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve(''),
      });

      await expect(
        parseTradeInImage('base64data', 'image/png', {})
      ).rejects.toThrow('AI image scanning is not available at this time. Please add items manually.');
    });
  });
});
