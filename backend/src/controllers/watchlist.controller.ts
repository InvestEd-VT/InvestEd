import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as watchlistService from '../services/watchlist.service.js';

export const getWatchlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const watchlist = await watchlistService.getWatchlist(req.userId!);
    res.json({ watchlist });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }
    const item = await watchlistService.addToWatchlist(req.userId!, symbol);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const symbol = req.params.symbol as string;
    await watchlistService.removeFromWatchlist(req.userId!, symbol);
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    next(error);
  }
};
