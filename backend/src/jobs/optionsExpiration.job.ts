import cron from 'node-cron';
import prisma from '../config/database.js';
import { processPositionExpiration } from '../services/exercise.service.js';

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

  for (const position of expiredPositions) {
    try {
      await processPositionExpiration(position.id);
    } catch (err) {
      console.error(`[expiration] Failed to process position ${position.id}:`, err);
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
