import { afterAll, afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'auth-logout-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const LOGOUT_ROUTE = '/api/v1/auth/logout';
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
    lastName: 'Logout',
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

describe('Auth Logout', () => {
  it('Should logout successfully', async () => {
    const user = await createTestUser();
    const { accessToken } = await loginTestUser(user);

    const response = await request(app)
      .post(LOGOUT_ROUTE)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Logged out successfully',
    });
  });

  it('Should invalidate refresh token after logout', async () => {
    const user = await createTestUser();
    const { accessToken, user: loggedInUser } = await loginTestUser(user);

    const logoutResponse = await request(app)
      .post(LOGOUT_ROUTE)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutResponse.status).toBe(200);

    const refreshedUser = await prisma.user.findUnique({
      where: { id: loggedInUser.id },
      select: { refreshToken: true },
    });

    expect(refreshedUser).not.toBeNull();
    expect(refreshedUser?.refreshToken).toBeNull();
  });

  it('Should return 401 when using old refresh token after logout', async () => {
    const user = await createTestUser();
    const { accessToken, refreshToken } = await loginTestUser(user);

    const logoutResponse = await request(app)
      .post(LOGOUT_ROUTE)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutResponse.status).toBe(200);

    const refreshResponse = await request(app).post(REFRESH_ROUTE).send({
      refreshToken,
    });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body).toEqual({
      error: 'Invalid refresh token',
    });
  });
});
