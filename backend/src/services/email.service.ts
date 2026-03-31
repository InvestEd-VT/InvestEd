import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Nodemailer transporter configured with Gmail credentials
 * Uses EMAIL_USER and EMAIL_PASS from environment variables
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

/**
 * Sends a verification email with a 24-hour expiry link
 * Used during registration to verify .edu email ownership
 * Link points to backend verification endpoint
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'Verify your InvestEd account',
    html: `
      <h1>Welcome to InvestEd</h1>
      <p>Click the link below to verify your account:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

/**
 * Sends a password reset email with a 1-hour expiry link
 * Link points to frontend reset password page with token as query param
 */
export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: email,
    subject: 'Reset your InvestEd password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};
