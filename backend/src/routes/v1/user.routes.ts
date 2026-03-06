import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/users/me
 * Protected route - returns the current authenticated user
 */
router.get('/me', authMiddleware, userController.getMe);

export default router;
