import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/database.js';
import { hashPassword } from '../services/auth.service.js';

const TEST_EMAIL_PREFIX = 'profile-e2e';
const LOGIN_ROUTE = '/api/v1/auth/login';
const USERS_ROUTE = '/api/v1/users';

let accessToken: string;
let testUserId: string;
const testPassword = 'Password123!';

beforeAll(async () => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const email = `${TEST_EMAIL_PREFIX}-${uniqueId}@test.edu`;
  const pw = await hashPassword(testPassword);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: pw,
      firstName: 'Profile',
      lastName: 'Test',
      portfolios: { create: { name: 'My Portfolio' } },
    },
  });

  testUserId = user.id;

  const loginResponse = await request(app)
    .post(LOGIN_ROUTE)
    .send({ email, password: testPassword });
  accessToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await prisma.portfolio.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
});

describe('User Profile API', () => {
  describe('GET /api/v1/users/profile', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get(`${USERS_ROUTE}/profile`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testUserId,
        firstName: 'Profile',
        lastName: 'Test',
        emailVerified: false,
      });
      // Should not expose sensitive fields
      expect(response.body.passwordHash).toBeUndefined();
      expect(response.body.refreshToken).toBeUndefined();
    });

    it('should return 401 without auth', async () => {
      const response = await request(app).get(`${USERS_ROUTE}/profile`);
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update first and last name', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Updated', lastName: 'Name' });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Name');
    });

    it('should update only first name', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'JustFirst' });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('JustFirst');
      expect(response.body.lastName).toBe('Name'); // unchanged
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/profile`)
        .send({ firstName: 'Hacker' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/change-password', () => {
    it('should reject without required fields', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject with wrong current password', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'WrongPassword1!', newPassword: 'NewPassword1!' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('incorrect');
    });

    it('should reject short new password', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: testPassword, newPassword: 'short' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('8 characters');
    });

    it('should change password successfully', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app)
        .put(`${USERS_ROUTE}/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: testPassword, newPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');

      // Verify can login with new password
      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      const loginResponse = await request(app)
        .post(LOGIN_ROUTE)
        .send({ email: user!.email, password: newPassword });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.accessToken).toBeDefined();
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .put(`${USERS_ROUTE}/change-password`)
        .send({ currentPassword: 'old', newPassword: 'new12345' });

      expect(response.status).toBe(401);
    });
  });
});
