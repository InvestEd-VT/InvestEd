import cron from 'node-cron';
import prisma from '../config/database.js';
import {
  processPositionExpiration,
  archiveExpiredPositions,
} from '../services/exercise.service.js';

/**
 * Find and process all expired options positions
 */
export const processExpiredOptions = async (): Promise<void> => {
  const now = new Date();

  const expiredPositions = await prisma.position.findMany({
    where: {
      status: 'OPEN',
      positionType: 'OPTION',
      expirationDate: { lte: now },
    },
  });

  if (expiredPositions.length === 0) {
    console.log('[expiration] No expired positions found');
    return;
  }

  console.log(`[expiration] Processing ${expiredPositions.length} expired position(s)...`);

  const portfolioIds = new Set<string>();

  for (const position of expiredPositions) {
    try {
      await processPositionExpiration(position.id);
      portfolioIds.add(position.portfolioId);
    } catch (err) {
      console.error(`[expiration] Failed to process position ${position.id}:`, err);
    }
  }

  // Archive expired/exercised positions after all are processed
  for (const portfolioId of portfolioIds) {
    try {
      const archived = await archiveExpiredPositions(portfolioId);
      console.log(`[expiration] Archived ${archived} position(s) for portfolio ${portfolioId}`);
    } catch (err) {
      console.error(`[expiration] Failed to archive positions for portfolio ${portfolioId}:`, err);
    }
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
