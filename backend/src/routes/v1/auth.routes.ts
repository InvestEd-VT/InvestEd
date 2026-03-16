import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from '../../validators/auth.validator.js';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Public route - no auth required
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/login
 * Public route - no auth required
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/v1/auth/refresh
 * Public route - refresh token validated in service
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/v1/auth/logout
 * Protected route - requires valid JWT
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * GET /api/v1/auth/verify/:token
 * Public route - no auth required
 */
router.get('/verify/:token', authController.verifyEmail);

/**
 * POST /api/v1/auth/forgot-password
 * Public route - no auth required
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * POST /api/v1/auth/reset-password
 * Public route - no auth required
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * POST /api/v1/auth/resend-verification
 * Public route - no auth required
 */
router.post(
  '/resend-verification',
  validate(resendVerificationSchema),
  authController.resendVerification
);

export default router;
