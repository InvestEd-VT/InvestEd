import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as tradeService from '../services/trade.service.js';

/**
 * POST /api/v1/trade/options/buy
 * Buy an options contract
 */
export const buyOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { symbol, contractSymbol, optionType, strikePrice, expirationDate, quantity, price } =
      req.body;

    if (
      !symbol ||
      !contractSymbol ||
      !optionType ||
      !strikePrice ||
      !expirationDate ||
      !quantity ||
      !price
    ) {
      res.status(400).json({
        error:
          'Missing required fields: symbol, contractSymbol, optionType, strikePrice, expirationDate, quantity, price',
      });
      return;
    }

    if (quantity <= 0 || price <= 0) {
      res.status(400).json({ error: 'Quantity and price must be positive numbers' });
      return;
    }

    if (!['CALL', 'PUT'].includes(optionType)) {
      res.status(400).json({ error: 'optionType must be CALL or PUT' });
      return;
    }

    const result = await tradeService.buyOption(userId, {
      symbol,
      contractSymbol,
      optionType,
      strikePrice,
      expirationDate,
      quantity,
      price,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/trade/options/sell
 * Sell an options contract
 */
export const sellOption = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { symbol, contractSymbol, optionType, strikePrice, expirationDate, quantity, price } =
      req.body;

    if (
      !symbol ||
      !contractSymbol ||
      !optionType ||
      !strikePrice ||
      !expirationDate ||
      !quantity ||
      !price
    ) {
      res.status(400).json({
        error:
          'Missing required fields: symbol, contractSymbol, optionType, strikePrice, expirationDate, quantity, price',
      });
      return;
    }

    if (quantity <= 0 || price <= 0) {
      res.status(400).json({ error: 'Quantity and price must be positive numbers' });
      return;
    }

    const result = await tradeService.sellOption(userId, {
      symbol,
      contractSymbol,
      optionType,
      strikePrice,
      expirationDate,
      quantity,
      price,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
