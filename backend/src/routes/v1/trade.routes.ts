import { Router } from 'express';
import * as tradeController from '../../controllers/trade.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/v1/trade/options/buy
 * @access Private
 * Buy an options contract
 */
router.post('/options/buy', authMiddleware, tradeController.buyOption);

/**
 * POST /api/v1/trade/options/sell
 * @access Private
 * Sell an options contract
 */
router.post('/options/sell', authMiddleware, tradeController.sellOption);

export default router;
