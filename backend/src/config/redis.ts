import { createClient, type RedisClientType } from 'redis';
import { env } from './env.js';
import logger from './logger.js';

let redisClient: RedisClientType | null = null;

if (env.REDIS_URL && env.NODE_ENV !== 'test') {
  try {
    redisClient = createClient({ url: env.REDIS_URL });

    redisClient.on('error', (err) => {
      logger.warn('Redis client error', { error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.connect().catch((err) => {
      logger.warn('Redis connection failed — running without cache', {
        error: err.message,
      });
      redisClient = null;
    });
  } catch (err) {
    logger.warn('Redis init failed — running without cache');
    redisClient = null;
  }
} else {
  logger.info('Redis not configured — running without cache');
}

// Safe wrapper that returns null operations when Redis is unavailable
export const redis = {
  async get(key: string): Promise<string | null> {
    try {
      return (await redisClient?.get(key)) ?? null;
    } catch {
      return null;
    }
  },
  async setEx(key: string, seconds: number, value: string): Promise<void> {
    try {
      await redisClient?.setEx(key, seconds, value);
    } catch {
      // Silently fail — cache is optional
    }
  },
  async del(key: string): Promise<void> {
    try {
      await redisClient?.del(key);
    } catch {
      // Silently fail
    }
  },
};

export default redis;
