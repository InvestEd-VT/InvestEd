import { Router } from 'express';
import * as portfolioController from '../../controllers/portfolio.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/portfolio
 * @access Private
 * Returns user's portfolio summary with positions, value, and P&L
 */
router.get('/', authMiddleware, portfolioController.getPortfolio);

/**
 * GET /api/v1/portfolio/positions
 * @access Private
 * Returns positions for user's portfolio
 * @query status - Filter by position status (OPEN, CLOSED, EXPIRED, EXERCISED)
 */
router.get('/positions', authMiddleware, portfolioController.getPositions);

export default router;
