import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'transactions-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const TRADE_ROUTE = '/api/v1/trade';
const PORTFOLIO_ROUTE = '/api/v1/portfolio';

let accessToken: string;
let testUserId: string;
let testPortfolioId: string;

beforeAll(async () => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `${TEST_EMAIL_PREFIX}-${uniqueId}@test.edu`;
  const password = 'Password123!';
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Tx',
      lastName: 'Test',
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

  // Create some trades for transaction history
  await request(app)
    .post(`${TRADE_ROUTE}/options/buy`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      symbol: 'AAPL',
      contractSymbol: 'AAPL260515C00250000',
      optionType: 'CALL',
      strikePrice: 250,
      expirationDate: '2026-05-15',
      quantity: 2,
      price: 5.0,
    });

  await request(app)
    .post(`${TRADE_ROUTE}/options/buy`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      symbol: 'TSLA',
      contractSymbol: 'TSLA260618P00200000',
      optionType: 'PUT',
      strikePrice: 200,
      expirationDate: '2026-06-18',
      quantity: 1,
      price: 12.0,
    });

  await request(app)
    .post(`${TRADE_ROUTE}/options/sell`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      symbol: 'AAPL',
      contractSymbol: 'AAPL260515C00250000',
      optionType: 'CALL',
      strikePrice: 250,
      expirationDate: '2026-05-15',
      quantity: 1,
      price: 7.0,
    });
});

afterAll(async () => {
  await prisma.transaction.deleteMany({ where: { portfolioId: testPortfolioId } });
  await prisma.position.deleteMany({ where: { portfolioId: testPortfolioId } });
  await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});

describe('Transactions API', () => {
  describe('GET /api/v1/portfolio/transactions', () => {
    it('should return all transactions', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.transactions).toBeInstanceOf(Array);
      expect(response.body.total).toBe(3);
      expect(response.body.transactions).toHaveLength(3);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/transactions?type=BUY`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(2);
      for (const tx of response.body.transactions) {
        expect(tx.type).toBe('BUY');
      }
    });

    it('should filter by symbol', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/transactions?symbol=TSLA`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      expect(response.body.transactions[0].symbol).toBe('TSLA');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/transactions?limit=2&offset=0`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.total).toBe(3);

      const page2 = await request(app)
        .get(`${PORTFOLIO_ROUTE}/transactions?limit=2&offset=2`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(page2.body.transactions).toHaveLength(1);
    });

    it('should return transactions in descending order', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/transactions`)
        .set('Authorization', `Bearer ${accessToken}`);

      const dates = response.body.transactions.map((t: { executedAt: string }) =>
        new Date(t.executedAt).getTime()
      );
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
      }
    });

    it('should return 401 without auth', async () => {
      const response = await request(app).get(`${PORTFOLIO_ROUTE}/transactions`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/portfolio/history', () => {
    it('should return portfolio history', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/history?period=30d`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.history.length).toBe(3);
      expect(response.body.currentCash).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      const response = await request(app).get(`${PORTFOLIO_ROUTE}/history`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/portfolio/reset', () => {
    it('should reject reset without confirmation', async () => {
      const response = await request(app)
        .post(`${PORTFOLIO_ROUTE}/reset`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('RESET');
    });

    it('should reset portfolio to $10,000', async () => {
      const response = await request(app)
        .post(`${PORTFOLIO_ROUTE}/reset`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ confirm: 'RESET' });

      expect(response.status).toBe(200);
      expect(response.body.cashBalance).toBe(10000);

      // Verify portfolio is actually reset
      const portfolio = await request(app)
        .get(PORTFOLIO_ROUTE)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(portfolio.body.cashBalance).toBe(10000);
      expect(portfolio.body.positions).toHaveLength(0);
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .post(`${PORTFOLIO_ROUTE}/reset`)
        .send({ confirm: 'RESET' });

      expect(response.status).toBe(401);
    });
  });
});
