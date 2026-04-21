import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';
import { startSnapshotJob } from './jobs/portfolioSnapshot.job.js';
import { startExpirationJob } from './jobs/optionsExpiration.job.js';
import { createPriceServer } from './websocket/priceServer.js';

// Create HTTP server from Express app (needed for WebSocket attachment)
const httpServer = createServer(app);

// Attach WebSocket price server
createPriceServer(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    port: env.PORT,
  });
  startSnapshotJob();
  startExpirationJob();
});

// Catch unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled rejection', { reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
