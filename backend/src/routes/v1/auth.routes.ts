import { Router } from 'express';
import * as authController from '../../controllers/auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../../validators/auth.validator';

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

export default router;
