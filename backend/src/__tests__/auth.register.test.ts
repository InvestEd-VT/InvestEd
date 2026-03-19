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

const getErrorMessagesForField = (
  errors: Array<{ field: string; message: string }>,
  field: string
): string[] => {
  return errors.filter((error) => error.field === field).map((error) => error.message);
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

describe('POST /api/v1/auth/register', () => {
  it('Should register a new user successfully', async () => {
    const payload = buildRegisterPayload();

    const response = await request(app).post(REGISTER_ROUTE).send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Registration successful, please verify your email',
    });

    const createdUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    expect(createdUser).not.toBeNull();
    expect(createdUser).toMatchObject({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      emailVerified: false,
    });
    expect(createdUser?.passwordHash).not.toBe(payload.password);
  });

  it(
    'Should return tokens on successful registration (blocked: registration currently returns only a success message)',
    async () => {
      const payload = buildRegisterPayload();

      const response = await request(app).post(REGISTER_ROUTE).send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    }
  );

  it('Should create a portfolio with $10K balance', async () => {
    const payload = buildRegisterPayload();

    const response = await request(app).post(REGISTER_ROUTE).send(payload);

    expect(response.status).toBe(201);

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

  it('Should return 409 for duplicate email', async () => {
    const payload = buildRegisterPayload();

    const firstResponse = await request(app).post(REGISTER_ROUTE).send(payload);
    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(app).post(REGISTER_ROUTE).send(payload);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toEqual({
      error: 'Email already registered',
    });
  });

  it('Should return 400 for invalid email format', async () => {
    const payload = buildRegisterPayload();

    const response = await request(app).post(REGISTER_ROUTE).send({
      ...payload,
      email: 'invalid-email-format',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        {
          field: 'email',
          message: 'Valid email required',
        },
      ])
    );
  });

  it('Should return 400 for password less than 8 chars', async () => {
    const payload = buildRegisterPayload();

    const response = await request(app).post(REGISTER_ROUTE).send({
      ...payload,
      password: 'Short1!',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [
        {
          field: 'password',
          message: 'Password must be at least 8 characters',
        },
      ],
    });
  });

  it('Should return 400 for missing required fields', async () => {
    const payload = buildRegisterPayload();

    const response = await request(app).post(REGISTER_ROUTE).send({
      email: payload.email,
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        {
          field: 'firstName',
          message: 'First name required',
        },
        {
          field: 'lastName',
          message: 'Last name required',
        },
      ])
    );

    const passwordErrors = getErrorMessagesForField(response.body.errors, 'password');
    const firstNameErrors = getErrorMessagesForField(response.body.errors, 'firstName');
    const lastNameErrors = getErrorMessagesForField(response.body.errors, 'lastName');

    expect(passwordErrors.length).toBeGreaterThan(0);
    expect(passwordErrors.every((message) => typeof message === 'string' && message.length > 0)).toBe(
      true
    );
    expect(firstNameErrors).toContain('First name required');
    expect(lastNameErrors).toContain('Last name required');
  });
});
