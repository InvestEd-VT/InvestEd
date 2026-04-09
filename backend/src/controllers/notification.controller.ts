import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as notificationService from '../services/notification.service.js';

/**
 * GET /api/v1/notifications
 */
export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const read = req.query.read !== undefined ? req.query.read === 'true' : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const result = await notificationService.getNotifications(userId, { read, limit, offset });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await notificationService.markAsRead(userId, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await notificationService.deleteNotification(userId, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
