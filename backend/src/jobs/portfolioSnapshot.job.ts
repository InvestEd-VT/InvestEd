import cron from 'node-cron';
import prisma from '../config/database.js';
import { Prisma } from '@prisma/client';
import logger from '../config/logger.js';

export const takePortfolioSnapshot = async () => {
  const portfolios = await prisma.portfolio.findMany({
    include: { positions: true },
  });

  for (const portfolio of portfolios) {
    const positionsValue = portfolio.positions.reduce(
      (sum: number, p: { quantity: Prisma.Decimal; avgCost: Prisma.Decimal }) => {
        return sum + Number(p.quantity) * Number(p.avgCost);
      },
      0
    );

    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue: portfolio.cashBalance + positionsValue,
        cashBalance: portfolio.cashBalance,
        positionsValue,
      },
    });
  }

  logger.info(`[snapshot] Captured ${portfolios.length} portfolio snapshots`);
};

export const startSnapshotJob = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('[snapshot] Running daily portfolio snapshot...');
    await takePortfolioSnapshot();
  });
  logger.info('[snapshot] Daily snapshot job scheduled');
};
