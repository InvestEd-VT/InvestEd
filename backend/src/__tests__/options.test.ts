import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

/**
 * Options API E2E Tests
 * Note: These hit the real Massive/Polygon API (free tier: 5 calls/min)
 * Tests are kept minimal to avoid rate limiting
 */

const TEST_EMAIL_PREFIX = 'options-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const OPTIONS_ROUTE = '/api/v1/options';

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
      firstName: 'Options',
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

describe('Options API', () => {
  describe('Auth protection', () => {
    it('should return 401 on contracts without auth', async () => {
      const response = await request(app).get(`${OPTIONS_ROUTE}/contracts/AAPL`);
      expect(response.status).toBe(401);
    });

    it('should return 401 on chain without auth', async () => {
      const response = await request(app).get(`${OPTIONS_ROUTE}/chain/AAPL`);
      expect(response.status).toBe(401);
    });
  });

  describe('Massive API integration', () => {
    it('should get options contracts and chain for AAPL', async () => {
      // Wait for rate limit window to reset when running full suite
      await new Promise((resolve) => setTimeout(resolve, 12000));

      // Test 1: Get contracts
      const contractsResponse = await request(app)
        .get(`${OPTIONS_ROUTE}/contracts/AAPL?contract_type=call&limit=5`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(contractsResponse.status).toBe(200);
      expect(contractsResponse.body.contracts).toBeInstanceOf(Array);
      expect(contractsResponse.body.contracts.length).toBeGreaterThan(0);

      const contract = contractsResponse.body.contracts[0];
      expect(contract).toMatchObject({
        ticker: expect.stringContaining('AAPL'),
        contract_type: 'call',
        strike_price: expect.any(Number),
        expiration_date: expect.any(String),
        underlying_ticker: 'AAPL',
      });

      // Test 2: Get chain (uses 1 API call internally)
      const chainResponse = await request(app)
        .get(`${OPTIONS_ROUTE}/chain/AAPL`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(chainResponse.status).toBe(200);
      expect(chainResponse.body.calls).toBeInstanceOf(Array);
      expect(chainResponse.body.puts).toBeInstanceOf(Array);
      expect(chainResponse.body.expirationDates).toBeInstanceOf(Array);
      expect(chainResponse.body.calls.length).toBeGreaterThan(0);
      expect(chainResponse.body.puts.length).toBeGreaterThan(0);
      expect(chainResponse.body.expirationDates.length).toBeGreaterThan(0);

      // Verify expiration dates are sorted
      const dates = chainResponse.body.expirationDates;
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i] >= dates[i - 1]).toBe(true);
      }
    }, 30000);
  });
});
