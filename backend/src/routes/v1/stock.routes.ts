import { Router } from 'express';
import * as stockController from '../../controllers/stock.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/stocks/search?q=apple&limit=10
 * @access Private
 * Search for stocks by name or ticker
 */
router.get('/search', authMiddleware, stockController.searchStocks);

/**
 * GET /api/v1/stocks/:symbol
 * @access Private
 * Get detailed info for a specific stock
 */
router.get('/:symbol', authMiddleware, stockController.getTickerDetails);

/**
 * GET /api/v1/stocks/:symbol/price
 * @access Private
 * Get current price for a stock
 */
router.get('/:symbol/price', authMiddleware, stockController.getStockPrice);

/**
 * GET /api/v1/stocks/:symbol/history?from=2026-01-01&to=2026-03-23&timespan=day
 * @access Private
 * Get historical price bars
 */
router.get('/:symbol/history', authMiddleware, stockController.getStockHistory);

export default router;
