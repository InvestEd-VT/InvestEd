import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/users/me
 * Protected route - returns the current authenticated user
 */
router.get('/me', authMiddleware, userController.getMe);

/**
 * GET /api/v1/users/profile
 * @access Private
 * Returns full user profile
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * PUT /api/v1/users/profile
 * @access Private
 * Update first and last name
 */
router.put('/profile', authMiddleware, userController.updateProfile);

/**
 * PUT /api/v1/users/change-password
 * @access Private
 * Change password (requires current password)
 */
router.put('/change-password', authMiddleware, userController.changePassword);

export default router;
