import cron from 'node-cron';
import prisma from '../config/database';

export const takePortfolioSnapshot = async () => {
  const portfolios = await prisma.portfolio.findMany({
    include: { positions: true },
  });

  for (const portfolio of portfolios) {
    const positionsValue = portfolio.positions.reduce((sum, p) => {
      return sum + Number(p.quantity) * Number(p.avgCost);
    }, 0);

    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue: portfolio.cashBalance + positionsValue,
        cashBalance: portfolio.cashBalance,
        positionsValue,
      },
    });
  }

  console.log(`[snapshot] Captured ${portfolios.length} portfolio snapshots`);
};

export const startSnapshotJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[snapshot] Running daily portfolio snapshot...');
    await takePortfolioSnapshot();
  });
  console.log('[snapshot] Daily snapshot job scheduled');
};
