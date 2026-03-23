import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

/**
 * Stocks API E2E Tests
 * Note: These hit the real Massive/Polygon API (free tier: 5 calls/min)
 * Tests are kept minimal to avoid rate limiting
 */

const TEST_EMAIL_PREFIX = 'stocks-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const STOCKS_ROUTE = '/api/v1/stocks';

let accessToken: string;
let testUserId: string;

beforeAll(async () => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `${TEST_EMAIL_PREFIX}-${uniqueId}@test.edu`;
  const password = 'Password123!';
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Stock',
      lastName: 'Test',
      portfolios: { create: { name: 'My Portfolio' } },
    },
  });

  testUserId = user.id;

  const loginResponse = await request(app).post(LOGIN_ROUTE).send({ email, password });
  accessToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});

describe('Stocks API', () => {
  describe('Auth protection', () => {
    it('should return 401 on search without auth', async () => {
      const response = await request(app).get(`${STOCKS_ROUTE}/search?q=apple`);
      expect(response.status).toBe(401);
    });

    it('should return 401 on ticker details without auth', async () => {
      const response = await request(app).get(`${STOCKS_ROUTE}/AAPL`);
      expect(response.status).toBe(401);
    });
  });

  describe('Input validation', () => {
    it('should return 400 on search without query parameter', async () => {
      const response = await request(app)
        .get(`${STOCKS_ROUTE}/search`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 on history without from/to params', async () => {
      const response = await request(app)
        .get(`${STOCKS_ROUTE}/AAPL/history`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Massive API integration', () => {
    // Helper: retry a request if rate limited (429)
    const retryOnRateLimit = async (
      fn: () => ReturnType<typeof request>,
      maxRetries = 3,
      delayMs = 15000
    ) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const response = await fn();
        if (response.status !== 429) return response;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      return fn();
    };

    it('should search stocks, get price, and get history', async () => {
      // Test 1: Search
      const searchResponse = await retryOnRateLimit(() =>
        request(app)
          .get(`${STOCKS_ROUTE}/search?q=apple&limit=3`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.results).toBeInstanceOf(Array);
      expect(searchResponse.body.results.length).toBeGreaterThan(0);

      const aapl = searchResponse.body.results.find(
        (r: { ticker: string }) => r.ticker === 'AAPL'
      );
      expect(aapl).toBeDefined();
      expect(aapl.name).toContain('Apple');

      // Test 2: Price
      const priceResponse = await retryOnRateLimit(() =>
        request(app)
          .get(`${STOCKS_ROUTE}/AAPL/price`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(priceResponse.status).toBe(200);
      expect(priceResponse.body).toMatchObject({
        ticker: 'AAPL',
        close: expect.any(Number),
        open: expect.any(Number),
        high: expect.any(Number),
        low: expect.any(Number),
        volume: expect.any(Number),
      });
      expect(priceResponse.body.close).toBeGreaterThan(0);

      // Test 3: History
      const historyResponse = await retryOnRateLimit(() =>
        request(app)
          .get(`${STOCKS_ROUTE}/AAPL/history?from=2026-03-10&to=2026-03-21&timespan=day`)
          .set('Authorization', `Bearer ${accessToken}`)
      );

      expect(historyResponse.status).toBe(200);
      expect(historyResponse.body.ticker).toBe('AAPL');
      expect(historyResponse.body.bars).toBeInstanceOf(Array);
      expect(historyResponse.body.bars.length).toBeGreaterThan(0);

      const bar = historyResponse.body.bars[0];
      expect(bar).toMatchObject({
        o: expect.any(Number),
        h: expect.any(Number),
        l: expect.any(Number),
        c: expect.any(Number),
        v: expect.any(Number),
      });
    }, 120000); // 2min timeout to handle rate limit retries
  });
});
