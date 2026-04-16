import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword, hashToken } from '../services/auth.service.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

vi.mock('../services/email.service.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

const TEST_EMAIL_PREFIX = 'auth-password-e2e';
const FORGOT_PASSWORD_ROUTE = '/api/v1/auth/forgot-password';
const RESET_PASSWORD_ROUTE = '/api/v1/auth/reset-password';
const LOGIN_ROUTE = '/api/v1/auth/login';
const REFRESH_ROUTE = '/api/v1/auth/refresh';

type TestUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const buildUserPayload = (): TestUserPayload => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    email: `${TEST_EMAIL_PREFIX}-${uniqueId}@test.edu`,
    password: 'Password123!',
    firstName: 'Auth',
    lastName: 'Password',
  };
};

const createVerifiedUser = async (overrides?: Partial<TestUserPayload>) => {
  const payload = {
    ...buildUserPayload(),
    ...overrides,
  };
  const passwordHash = await hashPassword(payload.password);

  const createdUser = await prisma.user.create({
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

  return {
    payload,
    userId: createdUser.id,
  };
};

const loginTestUser = async (user: TestUserPayload) => {
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

const requestResetAndCaptureToken = async (email: string) => {
  const response = await request(app).post(FORGOT_PASSWORD_ROUTE).send({ email });

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    message: 'If that email exists you will receive a reset link',
  });

  const mockedSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);

  expect(mockedSendPasswordResetEmail).toHaveBeenCalledTimes(1);
  expect(mockedSendPasswordResetEmail).toHaveBeenCalledWith(email, expect.any(String));

  const resetToken = mockedSendPasswordResetEmail.mock.calls[0]?.[1];

  expect(resetToken).toEqual(expect.any(String));

  return resetToken as string;
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

describe('Auth Password Reset', () => {
  it('Should send reset email for valid account', async () => {
    const { payload } = await createVerifiedUser();

    const response = await request(app).post(FORGOT_PASSWORD_ROUTE).send({
      email: payload.email,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'If that email exists you will receive a reset link',
    });

    const mockedSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);

    expect(mockedSendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(mockedSendPasswordResetEmail).toHaveBeenCalledWith(payload.email, expect.any(String));
    const rawResetToken = mockedSendPasswordResetEmail.mock.calls[0]?.[1];

    const updatedUser = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.resetToken).toBe(hashToken(rawResetToken as string));
    expect(updatedUser?.resetTokenExpiry).not.toBeNull();
    expect(updatedUser!.resetTokenExpiry!.getTime()).toBeGreaterThan(Date.now());
  });

  it('Should return success for non-existent email', async () => {
    const response = await request(app)
      .post(FORGOT_PASSWORD_ROUTE)
      .send({
        email: `${TEST_EMAIL_PREFIX}-missing@test.edu`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'If that email exists you will receive a reset link',
    });

    expect(vi.mocked(sendPasswordResetEmail)).not.toHaveBeenCalled();
  });

  it('Should reset password successfully with valid token', async () => {
    const { payload } = await createVerifiedUser();
    const resetToken = await requestResetAndCaptureToken(payload.email);
    const newPassword = 'NewPassword123!';

    const response = await request(app).post(RESET_PASSWORD_ROUTE).send({
      token: resetToken,
      newPassword,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Password reset successfully',
    });

    const updatedUser = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        resetToken: true,
        resetTokenExpiry: true,
        refreshToken: true,
      },
    });

    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.resetToken).toBeNull();
    expect(updatedUser?.resetTokenExpiry).toBeNull();
    expect(updatedUser?.refreshToken).toBeNull();

    const loginResponse = await request(app).post(LOGIN_ROUTE).send({
      email: payload.email,
      password: newPassword,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: payload.email,
      },
    });
  });

  it('Should return 400 for expired reset token', async () => {
    const { payload } = await createVerifiedUser();
    const rawResetToken = `expired-reset-token-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    await prisma.user.update({
      where: { email: payload.email },
      data: {
        resetToken: hashToken(rawResetToken),
        resetTokenExpiry: new Date(Date.now() - 60 * 1000),
      },
    });

    const response = await request(app).post(RESET_PASSWORD_ROUTE).send({
      token: rawResetToken,
      newPassword: 'NewPassword123!',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid or expired reset token',
    });
  });

  it('Should return 400 for invalid reset token', async () => {
    const response = await request(app).post(RESET_PASSWORD_ROUTE).send({
      token: 'invalid-reset-token',
      newPassword: 'NewPassword123!',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid or expired reset token',
    });
  });

  it('Should invalidate existing sessions after password reset', async () => {
    const { payload } = await createVerifiedUser();
    const loginResponse = await loginTestUser(payload);
    const resetToken = await requestResetAndCaptureToken(payload.email);

    const resetResponse = await request(app).post(RESET_PASSWORD_ROUTE).send({
      token: resetToken,
      newPassword: 'NewPassword123!',
    });

    expect(resetResponse.status).toBe(200);

    const refreshResponse = await request(app).post(REFRESH_ROUTE).send({
      refreshToken: loginResponse.refreshToken,
    });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body).toEqual({
      error: 'Invalid refresh token',
    });
  });

  it('Should prevent login with old password after reset', async () => {
    const { payload } = await createVerifiedUser();
    const resetToken = await requestResetAndCaptureToken(payload.email);
    const newPassword = 'NewPassword123!';

    const resetResponse = await request(app).post(RESET_PASSWORD_ROUTE).send({
      token: resetToken,
      newPassword,
    });

    expect(resetResponse.status).toBe(200);

    const oldPasswordLoginResponse = await request(app).post(LOGIN_ROUTE).send({
      email: payload.email,
      password: payload.password,
    });

    expect(oldPasswordLoginResponse.status).toBe(401);
    expect(oldPasswordLoginResponse.body).toEqual({
      error: 'Invalid email or password',
    });

    const newPasswordLoginResponse = await request(app).post(LOGIN_ROUTE).send({
      email: payload.email,
      password: newPassword,
    });

    expect(newPasswordLoginResponse.status).toBe(200);
    expect(newPasswordLoginResponse.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: payload.email,
      },
    });
  });
});
