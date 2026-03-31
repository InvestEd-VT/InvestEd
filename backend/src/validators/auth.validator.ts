import { body, ValidationChain } from 'express-validator';

// Validation schemas for authentication routes
export const loginSchema: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

// Registration schema with .edu email validation
export const registerSchema: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith('.edu')) {
        throw new Error('Only .edu email addresses are allowed');
      }
      return true;
    }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
];

// Forgot Password Schema
export const forgotPasswordSchema: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email required'),
];

// Reset Password Schema - requires token and password length
export const resetPasswordSchema: ValidationChain[] = [
  body('token').notEmpty().withMessage('Token required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

// Resend Verification Schema
export const resendVerificationSchema: ValidationChain[] = [
  body('token').notEmpty().withMessage('Token required'),
];