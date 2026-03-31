import { Router } from 'express';
import * as optionsController from '../../controllers/options.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/options/contracts/:symbol?contract_type=call&expiration_date=2026-04-18
 * @access Private
 * Get options contracts for an underlying ticker
 */
router.get('/contracts/:symbol', authMiddleware, optionsController.getOptionsContracts);

/**
 * GET /api/v1/options/chain/:symbol?expiration_date=2026-04-18
 * @access Private
 * Get options chain with calls and puts grouped
 */
router.get('/chain/:symbol', authMiddleware, optionsController.getOptionsChain);

export default router;
