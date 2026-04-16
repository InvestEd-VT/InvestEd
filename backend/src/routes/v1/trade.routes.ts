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

export default router;
