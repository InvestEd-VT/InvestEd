import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import * as notificationService from './notification.service.js';
import logger from '../config/logger.js';

export const getAlerts = async (userId: string) => {
  return prisma.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createAlert = async (
  userId: string,
  data: { symbol: string; targetPrice: number; condition: 'ABOVE' | 'BELOW' }
) => {
  return prisma.priceAlert.create({
    data: {
      userId,
      symbol: data.symbol.toUpperCase(),
      targetPrice: data.targetPrice,
      condition: data.condition,
    },
  });
};

export const deleteAlert = async (userId: string, alertId: string) => {
  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  return prisma.priceAlert.delete({ where: { id: alertId } });
};

/**
 * Check all active alerts against current prices.
 * Called from the WebSocket price broadcast loop.
 */
export const checkAlerts = async (
  prices: Map<string, { price: number }>
): Promise<void> => {
  const activeAlerts = await prisma.priceAlert.findMany({
    where: { triggered: false },
  });

  for (const alert of activeAlerts) {
    const priceData = prices.get(alert.symbol.toUpperCase());
    if (!priceData) continue;

    const currentPrice = priceData.price;
    const shouldTrigger =
      (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
      (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice);

    if (shouldTrigger) {
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { triggered: true, triggeredAt: new Date() },
      });

      try {
        await notificationService.createNotification(
          alert.userId,
          'TRADE_EXECUTED',
          'Price Alert Triggered',
          `${alert.symbol} is now $${currentPrice.toFixed(2)} (${alert.condition.toLowerCase()} $${alert.targetPrice.toFixed(2)})`
        );
      } catch (err) {
        logger.error('Failed to send alert notification', {
          alertId: alert.id,
          error: (err as Error).message,
        });
      }
    }
  }
};
