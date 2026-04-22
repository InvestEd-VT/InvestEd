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
 * GET /api/v1/portfolio/export/csv
 * Export portfolio positions and transactions as CSV
 */
export const exportCsv = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const type = (req.query.type as string) || 'positions';

    if (type === 'transactions') {
      const { transactions } = await portfolioService.getTransactions(userId, {});
      const header = 'Date,Type,Symbol,Option Type,Strike,Expiration,Quantity,Price,Total\n';
      const rows = transactions
        .map((tx) => {
          const total = Number(tx.quantity) * Number(tx.price) * 100;
          return `${new Date(tx.executedAt).toISOString().split('T')[0]},${tx.type},${tx.symbol},${tx.optionType ?? ''},${tx.strikePrice ? Number(tx.strikePrice) : ''},${tx.expirationDate ? new Date(tx.expirationDate).toISOString().split('T')[0] : ''},${Number(tx.quantity)},${Number(tx.price)},${total.toFixed(2)}`;
        })
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(header + rows);
    } else {
      const portfolio = await portfolioService.getPortfolio(userId);
      const positions = portfolio.positions || [];
      const header =
        'Symbol,Type,Option Type,Strike,Expiration,Quantity,Avg Cost,Market Value,Cost Basis,P&L,P&L %\n';
      const rows = positions
        .map(
          (p: Record<string, unknown>) =>
            `${p.symbol},${p.positionType},${p.optionType ?? ''},${p.strikePrice ?? ''},${p.expirationDate ? new Date(p.expirationDate as string).toISOString().split('T')[0] : ''},${p.quantity},${p.avgCost},${p.marketValue ?? ''},${p.costBasis ?? ''},${p.unrealizedPnL ?? ''},${typeof p.unrealizedPnLPercent === 'number' ? p.unrealizedPnLPercent.toFixed(2) : ''}`
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=portfolio.csv');
      res.send(header + rows);
    }
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
