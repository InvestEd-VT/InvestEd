import { Router } from 'express';
import * as priceAlertController from '../../controllers/priceAlert.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, priceAlertController.getAlerts);
router.post('/', authMiddleware, priceAlertController.createAlert);
router.delete('/:id', authMiddleware, priceAlertController.deleteAlert);

export default router;
