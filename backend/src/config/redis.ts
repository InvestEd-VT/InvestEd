import { createClient } from 'redis';
import { env } from './env.js';
import logger from './logger.js';

const redisClient = createClient({ url: env.REDIS_URL });

redisClient.on('error', (err) => {
  logger.error('Redis client error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis connected', { url: env.REDIS_URL });
});

// Connect on import — skip in test environment
if (env.NODE_ENV !== 'test') {
  redisClient.connect().catch((err) => {
    logger.error('Redis connection failed', { error: err.message });
  });
}

export default redisClient;
