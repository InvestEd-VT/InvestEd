import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'trade-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const TRADE_ROUTE = '/api/v1/trade';
const PORTFOLIO_ROUTE = '/api/v1/portfolio';

let accessToken: string;
let testUserId: string;
let testPortfolioId: string;

const createTestUserAndLogin = async () => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `${TEST_EMAIL_PREFIX}-${uniqueId}@test.edu`;
  const password = 'Password123!';
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Trade',
      lastName: 'Test',
      emailVerified: true,
      portfolios: {
        create: { name: 'My Portfolio', cashBalance: 10000 },
      },
    },
    include: { portfolios: true },
  });

  testUserId = user.id;
  testPortfolioId = user.portfolios[0].id;

  const loginResponse = await request(app).post(LOGIN_ROUTE).send({ email, password });
  accessToken = loginResponse.body.accessToken;
};

beforeAll(async () => {
  await createTestUserAndLogin();
});

afterAll(async () => {
  await prisma.transaction.deleteMany({ where: { portfolioId: testPortfolioId } });
  await prisma.position.deleteMany({ where: { portfolioId: testPortfolioId } });
  await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});

const buyPayload = {
  symbol: 'AAPL',
  contractSymbol: 'AAPL260515C00250000',
  optionType: 'CALL',
  strikePrice: 250,
  expirationDate: '2026-05-15',
  quantity: 2,
  price: 5.0,
};

describe('Trade API', () => {
  describe('POST /api/v1/trade/options/buy', () => {
    it('should buy an options contract and deduct cash', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(buyPayload);

      expect(response.status).toBe(201);
      expect(response.body.position).toMatchObject({
        symbol: 'AAPL',
        quantity: '2',
        avgCost: '5',
        positionType: 'OPTION',
        optionType: 'CALL',
        status: 'OPEN',
      });
      expect(response.body.transaction.type).toBe('BUY');
      // 10000 - (5 * 2 * 100) = 9000
      expect(response.body.cashBalance).toBe(9000);
    });

    it('should add to existing position with updated avg cost', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, quantity: 1, price: 8.0 });

      expect(response.status).toBe(201);
      // Now have 3 contracts: (5*2 + 8*1) / 3 = 6.00 avg cost
      expect(response.body.position.quantity).toBe('3');
      expect(Number(response.body.position.avgCost)).toBeCloseTo(6.0, 1);
      // 9000 - (8 * 1 * 100) = 8200
      expect(response.body.cashBalance).toBe(8200);
    });

    it('should reject buy with insufficient funds', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, quantity: 1000, price: 100 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient funds');
    });

    it('should reject buy with missing fields', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ symbol: 'AAPL' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject buy with negative quantity', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, quantity: -1 });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject buy with invalid option type', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, optionType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      const response = await request(app).post(`${TRADE_ROUTE}/options/buy`).send(buyPayload);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/trade/options/sell', () => {
    it('should sell part of a position and add cash', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/sell`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, quantity: 1, price: 7.5 });

      expect(response.status).toBe(200);
      // Had 3, sold 1 = 2 remaining
      expect(response.body.position.quantity).toBe('2');
      expect(response.body.position.status).toBe('OPEN');
      expect(response.body.transaction.type).toBe('SELL');
      // 8200 + (7.50 * 1 * 100) = 8950
      expect(response.body.cashBalance).toBe(8950);
    });

    it('should close position when selling all remaining', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/sell`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, quantity: 2, price: 6.0 });

      expect(response.status).toBe(200);
      expect(response.body.position.status).toBe('CLOSED');
      expect(Number(response.body.position.quantity)).toBe(0);
      // 8950 + (6 * 2 * 100) = 10150
      expect(response.body.cashBalance).toBe(10150);
    });

    it('should reject sell with no open position', async () => {
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/sell`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...buyPayload, quantity: 1, price: 5.0 });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No open position');
    });

    it('should reject sell exceeding position quantity', async () => {
      // Buy 1 with a unique contract to avoid interference from prior tests
      const uniquePayload = {
        ...buyPayload,
        contractSymbol: 'AAPL260618C00300000',
        strikePrice: 300,
        expirationDate: '2026-06-18',
        quantity: 1,
        price: 5.0,
      };

      await request(app)
        .post(`${TRADE_ROUTE}/options/buy`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(uniquePayload);

      // Try to sell 10 (only have 1)
      const response = await request(app)
        .post(`${TRADE_ROUTE}/options/sell`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...uniquePayload, quantity: 10, price: 5.0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient position');
    });

    it('should return 401 without auth', async () => {
      const response = await request(app).post(`${TRADE_ROUTE}/options/sell`).send(buyPayload);

      expect(response.status).toBe(401);
    });
  });
});
