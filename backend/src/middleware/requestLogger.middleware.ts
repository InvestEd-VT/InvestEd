import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.js';

/**
 * HTTP request logging middleware
 * Logs method, URL, status, response time, and content length
 * Replaces morgan with structured logging
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log after response is sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || '0',
      userAgent: req.get('user-agent'),
      ip: req.ip,
      // Include userId if authenticated (set by auth middleware)
      ...((req as unknown as { userId?: string }).userId && {
        userId: (req as unknown as { userId?: string }).userId,
      }),
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', meta);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', meta);
    } else {
      logger.info('Request completed', meta);
    }
  });

  next();
};
