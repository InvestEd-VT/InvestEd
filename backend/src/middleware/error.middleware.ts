import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { errorTracker } from '../services/errorTracking.service.js';

export const errorMiddleware = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Track every error through the error tracking service
  errorTracker.captureException(err, req);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
