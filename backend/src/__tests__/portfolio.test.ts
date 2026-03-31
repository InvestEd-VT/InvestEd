import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'portfolio-e2e';
const PORTFOLIO_ROUTE = '/api/v1/portfolio';
const LOGIN_ROUTE = '/api/v1/auth/login';

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
      firstName: 'Portfolio',
      lastName: 'Test',
      portfolios: {
        create: {
          name: 'My Portfolio',
          cashBalance: 10000,
        },
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
  await prisma.position.deleteMany({ where: { portfolioId: testPortfolioId } });
  await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});

describe('Portfolio API', () => {
  describe('GET /api/v1/portfolio', () => {
    it('should return portfolio with default $10,000 balance', async () => {
      const response = await request(app)
        .get(PORTFOLIO_ROUTE)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testPortfolioId,
        name: 'My Portfolio',
        cashBalance: 10000,
        positionsValue: 0,
        totalValue: 10000,
        totalPnL: 0,
        positions: [],
      });
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get(PORTFOLIO_ROUTE);
      expect(response.status).toBe(401);
    });

    it('should include stock positions with P&L calculation', async () => {
      // Create a stock position
      await prisma.position.create({
        data: {
          symbol: 'AAPL',
          quantity: 10,
          avgCost: 150.0,
          positionType: 'STOCK',
          status: 'OPEN',
          portfolioId: testPortfolioId,
        },
      });

      const response = await request(app)
        .get(PORTFOLIO_ROUTE)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.positions).toHaveLength(1);
      expect(response.body.positions[0]).toMatchObject({
        symbol: 'AAPL',
        quantity: 10,
        avgCost: 150,
        positionType: 'STOCK',
        marketValue: 1500, // 10 * 150 (using avgCost as placeholder price)
        costBasis: 1500,
        unrealizedPnL: 0,
      });
      expect(response.body.positionsValue).toBe(1500);
      expect(response.body.totalValue).toBe(11500); // 10000 + 1500
    });

    it('should include option positions with 100x multiplier', async () => {
      // Create an option position
      await prisma.position.create({
        data: {
          symbol: 'TSLA',
          quantity: 5,
          avgCost: 12.5,
          positionType: 'OPTION',
          optionType: 'CALL',
          strikePrice: 300,
          expirationDate: new Date('2026-06-18'),
          contractSymbol: 'TSLA260618C00300000',
          status: 'OPEN',
          portfolioId: testPortfolioId,
        },
      });

      const response = await request(app)
        .get(PORTFOLIO_ROUTE)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);

      const tslaPosition = response.body.positions.find(
        (p: { symbol: string }) => p.symbol === 'TSLA'
      );
      expect(tslaPosition).toBeDefined();
      expect(tslaPosition.positionType).toBe('OPTION');
      expect(tslaPosition.optionType).toBe('CALL');
      expect(tslaPosition.marketValue).toBe(6250); // 5 * 12.50 * 100
      expect(tslaPosition.costBasis).toBe(6250);
    });

    it('should not include closed positions', async () => {
      await prisma.position.create({
        data: {
          symbol: 'GOOG',
          quantity: 1,
          avgCost: 100,
          positionType: 'STOCK',
          status: 'CLOSED',
          portfolioId: testPortfolioId,
        },
      });

      const response = await request(app)
        .get(PORTFOLIO_ROUTE)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      const googPosition = response.body.positions.find(
        (p: { symbol: string }) => p.symbol === 'GOOG'
      );
      expect(googPosition).toBeUndefined();
    });
  });

  describe('GET /api/v1/portfolio/positions', () => {
    it('should return only open positions by default', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/positions`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.positions).toBeInstanceOf(Array);
      // Should not include GOOG (CLOSED)
      const symbols = response.body.positions.map((p: { symbol: string }) => p.symbol);
      expect(symbols).not.toContain('GOOG');
    });

    it('should filter positions by status', async () => {
      const response = await request(app)
        .get(`${PORTFOLIO_ROUTE}/positions?status=CLOSED`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      const symbols = response.body.positions.map((p: { symbol: string }) => p.symbol);
      expect(symbols).toContain('GOOG');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get(`${PORTFOLIO_ROUTE}/positions`);
      expect(response.status).toBe(401);
    });
  });
});
