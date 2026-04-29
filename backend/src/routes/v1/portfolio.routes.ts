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

/**
 * GET /api/v1/portfolio/transactions
 * @access Private
 * Returns transaction history with filtering
 * @query type, symbol, positionType, from, to, limit, offset
 */
router.get('/transactions', authMiddleware, portfolioController.getTransactions);

/**
 * GET /api/v1/portfolio/history
 * @access Private
 * Returns portfolio value history for charting
 * @query period - 7d, 30d, 90d, 1y, all
 */
router.get('/history', authMiddleware, portfolioController.getPortfolioHistory);

/**
 * GET /api/v1/portfolio/export/csv
 * @access Private
 * Export positions or transactions as CSV
 * @query type - 'positions' (default) or 'transactions'
 */
router.get('/export/csv', authMiddleware, portfolioController.exportCsv);

/**
 * POST /api/v1/portfolio/reset
 * @access Private
 * Resets portfolio to $10,000 (requires { confirm: "RESET" })
 */
router.post('/reset', authMiddleware, portfolioController.resetPortfolio);

export default router;
