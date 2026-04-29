import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication
// In production, add an admin role check middleware
router.get('/stats', authMiddleware, adminController.getStats);

export default router;
