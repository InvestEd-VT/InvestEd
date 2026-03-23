import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as portfolioService from '../services/portfolio.service.js';

/**
 * GET /api/v1/portfolio
 * Returns the user's portfolio with positions, total value, and P&L
 */
export const getPortfolio = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const portfolio = await portfolioService.getPortfolio(userId);
    res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/portfolio/positions
 * Returns positions for the user's portfolio
 * Query params: status (OPEN, CLOSED, EXPIRED, EXERCISED)
 */
export const getPositions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const status = req.query.status as 'OPEN' | 'CLOSED' | 'EXPIRED' | 'EXERCISED' | undefined;
    const positions = await portfolioService.getPositions(userId, status);
    res.json({ positions });
  } catch (error) {
    next(error);
  }
};
