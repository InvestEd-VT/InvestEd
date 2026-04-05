import { afterAll, afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'auth-login-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';

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
    lastName: 'Login',
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

describe('Auth Login', () => {
  it('Should login successfully with valid credentials', async () => {
    const user = await createTestUser();

    const response = await request(app).post(LOGIN_ROUTE).send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: expect.any(String),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: expect.any(String),
      },
    });
  });

  it('Should return tokens on successful login', async () => {
    const user = await createTestUser();

    const response = await request(app).post(LOGIN_ROUTE).send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
    expect(response.body.accessToken.length).toBeGreaterThan(0);
    expect(response.body.refreshToken.length).toBeGreaterThan(0);
  });

  it('Should return 401 for wrong password', async () => {
    const user = await createTestUser();

    const response = await request(app).post(LOGIN_ROUTE).send({
      email: user.email,
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid email or password',
    });
  });

  it('Should return 401 for non-existent email', async () => {
    const response = await request(app)
      .post(LOGIN_ROUTE)
      .send({
        email: `${TEST_EMAIL_PREFIX}-missing@test.edu`,
        password: 'Password123!',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid email or password',
    });
  });

  it('Should return 400 for invalid email format', async () => {
    const response = await request(app).post(LOGIN_ROUTE).send({
      email: 'invalid-email-format',
      password: 'Password123!',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          field: 'email',
          message: 'Valid email required',
        },
      ],
    });
  });
});
