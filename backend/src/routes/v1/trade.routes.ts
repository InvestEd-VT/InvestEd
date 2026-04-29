import { Router } from 'express';
import * as tradeController from '../../controllers/trade.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { buyOptionSchema, sellOptionSchema } from '../../validators/trade.validator.js';

const router = Router();

/**
 * POST /api/v1/trade/options/buy
 * @access Private
 * Buy an options contract
 */
router.post('/options/buy', authMiddleware, validate(buyOptionSchema), tradeController.buyOption);

/**
 * POST /api/v1/trade/options/sell
 * @access Private
 * Sell an options contract
 */
router.post(
  '/options/sell',
  authMiddleware,
  validate(sellOptionSchema),
  tradeController.sellOption
);

/**
 * GET /api/v1/trade/options/price
 * @access Private
 * Get theoretical price for an option contract (INVESTED-299)
 */
router.get('/options/price', authMiddleware, tradeController.getOptionPrice);

export default router;
