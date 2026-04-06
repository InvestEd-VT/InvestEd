import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as portfolioService from '../services/portfolio.service.js';

/**
 * GET /api/v1/portfolio
 * Returns the user's portfolio with positions, total value, and P&L
 */
export const getPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
export const getPositions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const status = req.query.status as 'OPEN' | 'CLOSED' | 'EXPIRED' | 'EXERCISED' | undefined;
    const positions = await portfolioService.getPositions(userId, status);
    res.json({ positions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/portfolio/transactions
 * Returns transaction history with filtering
 */
export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const result = await portfolioService.getTransactions(userId, {
      type: req.query.type as string,
      symbol: req.query.symbol as string,
      positionType: req.query.positionType as string,
      from: req.query.from as string,
      to: req.query.to as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sort: req.query.sort as 'asc' | 'desc',
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/portfolio/reset
 * Resets portfolio to initial $10,000 balance
 */
export const resetPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { confirm } = req.body;

    if (confirm !== 'RESET') {
      res
        .status(400)
        .json({ error: 'Must send { "confirm": "RESET" } to confirm portfolio reset' });
      return;
    }

    const result = await portfolioService.resetPortfolio(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/portfolio/history?period=30d
 * Returns portfolio value history for charting
 */
export const getPortfolioHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as string) || '30d';
    const result = await portfolioService.getPortfolioHistory(userId, period);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
