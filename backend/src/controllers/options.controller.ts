import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as massiveService from '../services/massive.service.js';

/**
 * GET /api/v1/options/contracts/:symbol
 * Get options contracts for an underlying ticker
 */
export const getOptionsContracts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const symbol = req.params.symbol as string;
    const contract_type = req.query.contract_type as 'call' | 'put' | undefined;
    const expiration_date = req.query.expiration_date as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const contracts = await massiveService.getOptionsContracts(symbol, {
      contract_type,
      expiration_date,
      expired: false,
      limit,
      sort: 'strike_price',
      order: 'asc',
    });

    res.json({ contracts });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/options/chain/:symbol?expiration_date=2026-04-18
 * Get options chain with calls and puts for a symbol
 */
export const getOptionsChain = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const symbol = req.params.symbol as string;
    const expiration_date = req.query.expiration_date as string | undefined;

    const chain = await massiveService.getOptionsChain(symbol, expiration_date);
    res.json(chain);
  } catch (error) {
    next(error);
  }
};
