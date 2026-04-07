import cron from 'node-cron';
import prisma from '../config/database.js';

export const processExpiredOptions = async () => {
  const now = new Date();

  const expiredPositions = await prisma.position.findMany({
    where: {
      status: 'OPEN',
      positionType: 'OPTION',
      expirationDate: { lte: now },
    },
    include: { portfolio: true },
  });

  if (expiredPositions.length === 0) {
    console.log('[expiration] No expired positions found');
    return;
  }

  console.log(`[expiration] Processing ${expiredPositions.length} expired position(s)...`);

  for (const position of expiredPositions) {
    const quantity = Number(position.quantity);
    const avgCost = Number(position.avgCost);
    const costBasis = avgCost * quantity * 100;

    // Calculate settlement P&L
    // For now positions expire worthless (OTM) — ITM auto-exercise comes in INVESTED-256
    const settlementValue = 0;
    const pnl = settlementValue - costBasis;

    await prisma.$transaction(async (tx) => {
      // Mark position as expired
      await tx.position.update({
        where: { id: position.id },
        data: { status: 'EXPIRED' },
      });

      // Update portfolio balance on expiration
      await tx.portfolio.update({
        where: { id: position.portfolioId },
        data: {
          cashBalance: {
            increment: settlementValue,
          },
        },
      });

      // Record expiration transaction
      await tx.transaction.create({
        data: {
          type: 'EXPIRED_WORTHLESS',
          symbol: position.symbol,
          quantity: position.quantity,
          price: 0,
          positionType: 'OPTION',
          optionType: position.optionType,
          strikePrice: position.strikePrice,
          expirationDate: position.expirationDate,
          contractSymbol: position.contractSymbol,
          portfolioId: position.portfolioId,
        },
      });
    });

    console.log(`[expiration] ${position.symbol} expired worthless — P&L: $${pnl.toFixed(2)}`);
  }

  console.log('[expiration] Done processing expired options');
};

export const startExpirationJob = () => {
  // Runs at 6pm ET daily (after market close)
  cron.schedule('0 18 * * 1-5', async () => {
    console.log('[expiration] Running options expiration processing...');
    await processExpiredOptions();
  });
  console.log('[expiration] Options expiration job scheduled');
};
