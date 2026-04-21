import { Request } from 'express';
import logger from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

interface ErrorContext {
  userId?: string;
  method?: string;
  url?: string;
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
}

/**
 * Centralized error tracking service
 * Logs structured error data for monitoring and alerting
 * Can be extended to forward to Sentry, Datadog, etc.
 */
class ErrorTrackingService {
  /**
   * Track an error with full request context
   */
  captureException(error: Error, req?: Request): void {
    const context = this.extractContext(req);
    const isOperational = error instanceof AppError;
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    const errorData = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        isOperational,
        statusCode,
      },
      context,
      timestamp: new Date().toISOString(),
    };

    // Operational errors (4xx) are expected — log as warnings
    // Unexpected errors (5xx) are bugs — log as errors
    if (isOperational && statusCode < 500) {
      logger.warn('Operational error', errorData);
    } else {
      logger.error('Unhandled error', errorData);
    }
  }

  /**
   * Track a custom event (e.g., failed trade, rate limit hit)
   */
  captureEvent(event: string, data?: Record<string, unknown>): void {
    logger.info(event, { event, ...data, timestamp: new Date().toISOString() });
  }

  /**
   * Track a warning (e.g., slow query, high memory usage)
   */
  captureWarning(message: string, data?: Record<string, unknown>): void {
    logger.warn(message, { ...data, timestamp: new Date().toISOString() });
  }

  private extractContext(req?: Request): ErrorContext {
    if (!req) return {};

    // Sanitize body — remove sensitive fields
    const sanitizedBody = req.body ? { ...req.body } : undefined;
    if (sanitizedBody) {
      delete sanitizedBody.password;
      delete sanitizedBody.token;
      delete sanitizedBody.refreshToken;
    }

    return {
      userId: ((req as unknown) as { userId?: string }).userId,
      method: req.method,
      url: req.originalUrl,
      body: sanitizedBody,
      params: req.params,
      query: req.query as Record<string, unknown>,
    };
  }
}

export const errorTracker = new ErrorTrackingService();
