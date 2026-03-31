import type { NextFunction, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';
import type { AuthRequest } from '../types/auth.types.js';

type MockResponse = Pick<Response, 'status' | 'json'>;

const createMockRequest = (authorization?: string): AuthRequest =>
  ({
    headers: authorization ? { authorization } : {},
  }) as AuthRequest;

const createMockResponse = (): MockResponse => {
  const res = {} as MockResponse;

  res.status = vi.fn().mockReturnValue(res) as Response['status'];
  res.json = vi.fn().mockReturnValue(res) as Response['json'];

  return res;
};

const createNext = (): NextFunction => vi.fn() as unknown as NextFunction;

describe('authMiddleware', () => {
  it('Should return 401 if no token', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createNext();

    authMiddleware(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
    expect(req.userId).toBeUndefined();
  });

  it('Should return 401 if token invalid', () => {
    const req = createMockRequest('Bearer not-a-valid-token');
    const res = createMockResponse();
    const next = createNext();

    authMiddleware(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
    expect(req.userId).toBeUndefined();
  });

  it('Should return 401 if token expired', () => {
    const expiredToken = jwt.sign({ userId: 'expired-user' }, env.JWT_SECRET, {
      expiresIn: '-1s',
    });
    const req = createMockRequest(`Bearer ${expiredToken}`);
    const res = createMockResponse();
    const next = createNext();

    authMiddleware(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
    expect(req.userId).toBeUndefined();
  });

  it('Should attach userId for valid token', () => {
    const token = jwt.sign({ userId: 'user-123' }, env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const req = createMockRequest(`Bearer ${token}`);
    const res = createMockResponse();
    const next = createNext();

    authMiddleware(req, res as Response, next);

    expect(req.userId).toBe('user-123');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
