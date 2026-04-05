import { afterAll, afterEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app.js';
import { env } from '../config/env.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'auth-refresh-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const REFRESH_ROUTE = '/api/v1/auth/refresh';

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const buildRegisterPayload = (): RegisterPayload => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    email: `${TEST_EMAIL_PREFIX}-${uniqueId}@test.edu`,
    password: 'Password123!',
    firstName: 'Auth',
    lastName: 'Refresh',
  };
};

const createTestUser = async (): Promise<RegisterPayload> => {
  const payload = buildRegisterPayload();
  const passwordHash = await hashPassword(payload.password);

  await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      emailVerified: true,
      portfolios: {
        create: {
          name: 'My Portfolio',
        },
      },
    },
  });

  return payload;
};

const loginTestUser = async (user: RegisterPayload) => {
  const response = await request(app).post(LOGIN_ROUTE).send({
    email: user.email,
    password: user.password,
  });

  expect(response.status).toBe(200);

  return response.body as {
    accessToken: string;
    refreshToken: string;
    user: { id: string };
  };
};

afterEach(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: TEST_EMAIL_PREFIX,
      },
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth Refresh', () => {
  it('Should refresh tokens with valid refresh token', async () => {
    const user = await createTestUser();
    const loginResponse = await loginTestUser(user);

    const response = await request(app).post(REFRESH_ROUTE).send({
      refreshToken: loginResponse.refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(response.body.accessToken.length).toBeGreaterThan(0);
    expect(response.body.refreshToken.length).toBeGreaterThan(0);
    expect(response.body.accessToken).not.toBe(loginResponse.accessToken);
    expect(response.body.refreshToken).not.toBe(loginResponse.refreshToken);
  });

  it('Should return 401 for invalid refresh token', async () => {
    const response = await request(app).post(REFRESH_ROUTE).send({
      refreshToken: 'not-a-valid-refresh-token',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid or expired refresh token',
    });
  });

  it('Should return 401 for expired refresh token', async () => {
    const user = await createTestUser();
    const createdUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    expect(createdUser).not.toBeNull();

    const expiredRefreshToken = jwt.sign({ userId: createdUser!.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: '-1s',
    });

    const response = await request(app).post(REFRESH_ROUTE).send({
      refreshToken: expiredRefreshToken,
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid or expired refresh token',
    });
  });

  it('Should invalidate old refresh token after use', async () => {
    const user = await createTestUser();
    const loginResponse = await loginTestUser(user);

    const firstRefreshResponse = await request(app).post(REFRESH_ROUTE).send({
      refreshToken: loginResponse.refreshToken,
    });

    expect(firstRefreshResponse.status).toBe(200);

    const secondRefreshResponse = await request(app).post(REFRESH_ROUTE).send({
      refreshToken: loginResponse.refreshToken,
    });

    expect(secondRefreshResponse.status).toBe(401);
    expect(secondRefreshResponse.body).toEqual({
      error: 'Invalid refresh token',
    });
  });
});
