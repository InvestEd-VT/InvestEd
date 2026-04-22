import { describe, expect, it, vi } from 'vitest';

// Mock the massive service before importing
vi.mock('../services/massive.service.js', () => ({
  getStockPrice: vi.fn().mockResolvedValue({
    symbol: 'AAPL',
    open: 195,
    high: 200,
    low: 194,
    close: 198,
    volume: 50000000,
    vwap: 197.5,
    timestamp: Date.now(),
  }),
  getStockHistory: vi.fn().mockResolvedValue(
    Array.from({ length: 30 }, (_, i) => ({
      c: 190 + i * 0.3,
      h: 191 + i * 0.3,
      l: 189 + i * 0.3,
      o: 190 + i * 0.3,
      v: 1000000,
    }))
  ),
}));

import {
  validateTradePrice,
  getTheoreticalPrice,
} from '../services/priceValidation.service.js';

describe('Price Validation Service', () => {
  describe('validateTradePrice', () => {
    it('should accept a price near the theoretical value', async () => {
      const result = await validateTradePrice('AAPL', 200, '2026-06-20', 'CALL', 5.0);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('theoreticalPrice');
      expect(result).toHaveProperty('minPrice');
      expect(result).toHaveProperty('maxPrice');
      expect(result.theoreticalPrice).toBeGreaterThan(0);
    });

    it('should reject a wildly inflated price', async () => {
      const result = await validateTradePrice('AAPL', 200, '2026-06-20', 'CALL', 500.0);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('outside the valid range');
    });

    it('should reject a zero price', async () => {
      const result = await validateTradePrice('AAPL', 200, '2026-06-20', 'CALL', 0.001);

      // Extremely low price should be outside the band
      expect(result.isValid).toBe(false);
    });

    it('should use wider tolerance for near-expiration options', async () => {
      // Tomorrow's expiration — should have 50% tolerance
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expStr = tomorrow.toISOString().split('T')[0];

      const result = await validateTradePrice('AAPL', 198, expStr, 'CALL', 2.0);

      expect(result.tolerance).toBe(0.5);
    });

    it('should use tighter tolerance for far-dated options', async () => {
      const farDate = new Date();
      farDate.setDate(farDate.getDate() + 60);
      const expStr = farDate.toISOString().split('T')[0];

      const result = await validateTradePrice('AAPL', 200, expStr, 'CALL', 10.0);

      expect(result.tolerance).toBe(0.25);
    });
  });

  describe('getTheoreticalPrice', () => {
    it('should return a positive theoretical price', async () => {
      const result = await getTheoreticalPrice('AAPL', 200, '2026-06-20', 'CALL');

      expect(result.theoreticalPrice).toBeGreaterThan(0);
      expect(result.stockPrice).toBe(198);
      expect(result.iv).toBeGreaterThan(0);
    });

    it('should return higher price for ITM calls', async () => {
      const itm = await getTheoreticalPrice('AAPL', 180, '2026-06-20', 'CALL');
      const otm = await getTheoreticalPrice('AAPL', 220, '2026-06-20', 'CALL');

      expect(itm.theoreticalPrice).toBeGreaterThan(otm.theoreticalPrice);
    });

    it('should return higher price for ITM puts', async () => {
      const itm = await getTheoreticalPrice('AAPL', 220, '2026-06-20', 'PUT');
      const otm = await getTheoreticalPrice('AAPL', 180, '2026-06-20', 'PUT');

      expect(itm.theoreticalPrice).toBeGreaterThan(otm.theoreticalPrice);
    });
  });
});
