import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as leaderboardService from '../services/leaderboard.service.js';

/**
 * GET /api/v1/leaderboard
 * Returns top 20 users ranked by portfolio P&L
 */
export const getLeaderboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leaderboard = await leaderboardService.getLeaderboard();
    res.json({ leaderboard, currentUserId: req.userId });
  } catch (error) {
    next(error);
  }
};
