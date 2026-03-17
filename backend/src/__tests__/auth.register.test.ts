import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';

vi.mock('../services/email.service.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const TEST_EMAIL_PREFIX = 'auth-register-e2e';
const REGISTER_ROUTE = '/api/v1/auth/register';

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
    lastName: 'Register',
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

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

describe('Auth Register', () => {
  it('Should create a default portfolio with $10,000 starting cash', async () => {
    const payload = buildRegisterPayload();

    const response = await request(app).post(REGISTER_ROUTE).send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Registration successful, please verify your email',
    });

    const createdUser = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        portfolios: true,
      },
    });

    expect(createdUser).not.toBeNull();
    expect(createdUser?.portfolios).toHaveLength(1);
    expect(createdUser?.portfolios[0]).toMatchObject({
      name: 'My Portfolio',
      cashBalance: 10000,
      userId: createdUser?.id,
    });
  });
});
