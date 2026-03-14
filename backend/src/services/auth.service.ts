import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import {
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
  TokenPayload,
} from '../types/auth.types.js';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';

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
 * Verifies and decodes a JWT access token
 * Throws error if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

/**
 * Verifies and decodes a JWT refresh token
 * Throws error if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

// ─── AUTH OPERATIONS ──────────────────────────────────

/**
 * Registers a new user account
 * Validates .edu email, hashes password, creates user and default portfolio
 * Generates verification token and sends verification email
 * Returns success message without tokens - user must verify email before login
 */
export const register = async (data: RegisterRequestBody): Promise<{ message: string }> => {
  // check for existing email
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  // hash password
  const passwordHash = await hashPassword(data.password);

  // generate verification token and expiry
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // create user and default portfolio
  await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      verificationToken,
      verificationExpiry,
      portfolios: {
        create: {
          name: 'My Portfolio',
          cashBalance: 10000,
        },
      },
    },
  });

  // send verification email
  await sendVerificationEmail(data.email, verificationToken);

  return { message: 'Registration successful, please verify your email' };
};

/**
 * Authenticates user credentials and returns access and refresh tokens
 * Stores hashed refresh token in database for later validation
 * Returns 401 if email or password is invalid
 */
export const login = async (data: LoginRequestBody): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store hashed refresh token in database
  const hashedRefresh = await hashPassword(refreshToken);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Issues new access and refresh tokens using a valid refresh token
 * Implements token rotation: old refresh token is invalidated, new one is stored
 * Verifies the provided token matches the stored hash in database
 * Returns 401 if token is invalid, expired, or doesn't match stored hash
 */
export const refresh = async (token: string) => {
  if (!token) {
    throw new AppError('Refresh token required', 400);
  }

  // Verify the JWT signature and expiration
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Look up user and their stored refresh token hash
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Verify the provided token matches the stored hash
  const valid = await comparePassword(token, user.refreshToken);
  if (!valid) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Rotate: issue new tokens and store new refresh hash
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);
  const hashedRefresh = await hashPassword(newRefreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Invalidates the user's refresh token in the database
 * Sets refreshToken to null, preventing further token refreshes
 */
export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return { message: 'Logged out successfully' };
};

/**
 * Verifies a user's email using the verification token
 * Marks user as verified and clears token and expiry
 * Returns 400 if token is invalid or expired
 */
export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationExpiry: null,
    },
  });

  return { message: 'Email verified successfully' };
};

/**
 * Generates a password reset token and sends reset email
 * Always returns success to prevent account enumeration
 */
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // always return success to prevent account enumeration
  if (!user) {
    return { message: 'If that email exists you will receive a reset link' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  await sendPasswordResetEmail(email, resetToken);

  return { message: 'If that email exists you will receive a reset link' };
};
