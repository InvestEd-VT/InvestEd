import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword, hashToken } from '../services/auth.service.js';
import { sendVerificationEmail } from '../services/email.service.js';

vi.mock('../services/email.service.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const TEST_EMAIL_PREFIX = 'auth-verify-e2e';
const REGISTER_ROUTE = '/api/v1/auth/register';
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
    lastName: 'Verify',
  };
};

const buildVerifyRoute = (token: string): string => `/api/v1/auth/verify/${token}`;

const createUnverifiedUser = async (options?: {
  verificationToken?: string;
  verificationExpiry?: Date;
}) => {
  const payload = buildRegisterPayload();
  const passwordHash = await hashPassword(payload.password);
  const rawVerificationToken =
    options?.verificationToken ??
    `verify-token-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const createdUser = await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      verificationToken: hashToken(rawVerificationToken),
      verificationExpiry: options?.verificationExpiry ?? new Date(Date.now() + 60 * 60 * 1000),
      portfolios: {
        create: {
          name: 'My Portfolio',
        },
      },
    },
  });

  return {
    payload,
    rawVerificationToken,
    userId: createdUser.id,
  };
};

const registerUserAndCaptureVerificationToken = async () => {
  const payload = buildRegisterPayload();

  const response = await request(app).post(REGISTER_ROUTE).send(payload);

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    message: 'Registration successful, please verify your email',
  });

  const mockedSendVerificationEmail = vi.mocked(sendVerificationEmail);

  expect(mockedSendVerificationEmail).toHaveBeenCalledTimes(1);
  expect(mockedSendVerificationEmail).toHaveBeenCalledWith(payload.email, expect.any(String));

  const verificationToken = mockedSendVerificationEmail.mock.calls[0]?.[1];

  expect(verificationToken).toEqual(expect.any(String));

  return {
    payload,
    verificationToken: verificationToken as string,
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

describe('Auth Email Verification', () => {
  it('Should verify email successfully with valid token', async () => {
    const { payload, verificationToken } = await registerUserAndCaptureVerificationToken();

    const response = await request(app).get(buildVerifyRoute(verificationToken));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Email verified successfully',
    });

    const verifiedUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    expect(verifiedUser).not.toBeNull();
    expect(verifiedUser?.emailVerified).toBe(true);
  });

  it('Should return 400 for expired verification token', async () => {
    const { rawVerificationToken } = await createUnverifiedUser({
      verificationExpiry: new Date(Date.now() - 60 * 1000),
    });

    const response = await request(app).get(buildVerifyRoute(rawVerificationToken));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid or expired verification token',
    });
  });

  it('Should return 400 for invalid verification token', async () => {
    const response = await request(app).get(buildVerifyRoute('invalid-verification-token'));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid or expired verification token',
    });
  });

  it('Should prevent login for unverified user', async () => {
    const { payload } = await registerUserAndCaptureVerificationToken();

    const response = await request(app).post(LOGIN_ROUTE).send({
      email: payload.email,
      password: payload.password,
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Please verify your email before logging in',
    });
  });

  it('Should allow login after successful verification', async () => {
    const { payload, verificationToken } = await registerUserAndCaptureVerificationToken();

    const verifyResponse = await request(app).get(buildVerifyRoute(verificationToken));

    expect(verifyResponse.status).toBe(200);

    const loginResponse = await request(app).post(LOGIN_ROUTE).send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        id: expect.any(String),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        createdAt: expect.any(String),
      },
    });
  });

  it('Should clear token and expiry after verification', async () => {
    const { payload, verificationToken } = await registerUserAndCaptureVerificationToken();

    const response = await request(app).get(buildVerifyRoute(verificationToken));

    expect(response.status).toBe(200);

    const verifiedUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    expect(verifiedUser).not.toBeNull();
    expect(verifiedUser?.emailVerified).toBe(true);
    expect(verifiedUser?.verificationToken).toBeNull();
    expect(verifiedUser?.verificationExpiry).toBeNull();
  });
});
