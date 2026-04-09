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

  const portfolioPositions = new Map<string, string[]>();

  for (const position of expiredPositions) {
    try {
      await processPositionExpiration(position.id);
      const ids = portfolioPositions.get(position.portfolioId) ?? [];
      ids.push(position.id);
      portfolioPositions.set(position.portfolioId, ids);
    } catch (err) {
      console.error(`[expiration] Failed to process position ${position.id}:`, err);
    }
  }

  for (const [portfolioId, positionIds] of portfolioPositions) {
    try {
      const archived = await archiveExpiredPositions(portfolioId, positionIds);
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
