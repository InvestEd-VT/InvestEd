import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as priceAlertService from '../services/priceAlert.service.js';

export const getAlerts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const alerts = await priceAlertService.getAlerts(req.userId!);
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};

export const createAlert = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { symbol, targetPrice, condition } = req.body;

    if (!symbol || !targetPrice || !condition) {
      res
        .status(400)
        .json({ error: 'symbol, targetPrice, and condition (ABOVE/BELOW) are required' });
      return;
    }

    if (!['ABOVE', 'BELOW'].includes(condition)) {
      res.status(400).json({ error: 'condition must be ABOVE or BELOW' });
      return;
    }

    const alert = await priceAlertService.createAlert(req.userId!, {
      symbol,
      targetPrice: parseFloat(targetPrice),
      condition,
    });
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const alertId = req.params.id as string;
    await priceAlertService.deleteAlert(req.userId!, alertId);
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};
