import { Router } from 'express';
import * as leaderboardController from '../../controllers/leaderboard.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/leaderboard
 * @access Private
 * Returns top 20 users ranked by portfolio P&L
 */
router.get('/', authMiddleware, leaderboardController.getLeaderboard);

export default router;
