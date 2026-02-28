import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// ─── TYPES ────────────────────────────────────────────

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// ─── PASSWORD HASHING ─────────────────────────────────

/**
 * Hashes a plain text password using bcrypt
 * Salt rounds set to 12 for security/performance balance
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

/**
 * Compares a plain text password against a bcrypt hash
 * Returns true if match, false if not
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ─── TOKEN GENERATION ─────────────────────────────────

/**
 * Generates a short lived JWT access token
 * Expires in 15 minutes
 */
export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generates a long lived JWT refresh token
 * Expires in 7 days
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// ─── TOKEN VERIFICATION ───────────────────────────────

/**
 * Verifies and decodes a JWT token
 * Throws error if token is invalid or expired
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

// Placeholder, to be replaced when auth service is implemented
export const register = async (data: unknown) => {
  throw new Error('Not implemented yet');
};

export const login = async (data: unknown) => {
  throw new Error('Not implemented yet');
};

export const refresh = async (token: string) => {
  throw new Error('Not implemented yet');
};

export const logout = async (userId: string) => {
  throw new Error('Not implemented yet');
};
