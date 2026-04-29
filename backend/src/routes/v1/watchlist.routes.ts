import { Router } from 'express';
import * as watchlistController from '../../controllers/watchlist.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, watchlistController.getWatchlist);
router.post('/', authMiddleware, watchlistController.addToWatchlist);
router.delete('/:symbol', authMiddleware, watchlistController.removeFromWatchlist);

export default router;
