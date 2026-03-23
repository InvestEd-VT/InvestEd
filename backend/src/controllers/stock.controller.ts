import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as massiveService from '../services/massive.service.js';

/**
 * GET /api/v1/stocks/search?q=apple
 * Search for stocks by name or ticker symbol
 */
export const searchStocks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.length < 1) {
      res.status(400).json({ error: 'Search query (q) is required' });
      return;
    }

    const results = await massiveService.searchStocks(query, limit);
    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/stocks/:symbol
 * Get detailed info for a specific stock
 */
export const getTickerDetails = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const details = await massiveService.getTickerDetails(symbol);
    res.json(details);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/stocks/:symbol/price
 * Get the current (previous day close) price for a stock
 */
export const getStockPrice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const price = await massiveService.getStockPrice(symbol);
    res.json(price);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/stocks/:symbol/history?from=2026-01-01&to=2026-03-23&timespan=day
 * Get historical price bars for a stock
 */
export const getStockHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.params;
    const from = req.query.from as string;
    const to = req.query.to as string;
    const timespan = (req.query.timespan as 'minute' | 'hour' | 'day' | 'week' | 'month') || 'day';

    if (!from || !to) {
      res.status(400).json({ error: 'from and to date parameters are required (YYYY-MM-DD)' });
      return;
    }

    const bars = await massiveService.getStockHistory(symbol, from, to, timespan);
    res.json({ ticker: symbol.toUpperCase(), bars });
  } catch (error) {
    next(error);
  }
};
