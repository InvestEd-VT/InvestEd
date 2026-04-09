import { NotificationType, Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/AppError.js';

/**
 * Creates a notification for a user
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue
) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data,
    },
  });
};

/**
 * Gets all notifications for a user
 */
export const getNotifications = async (
  userId: string,
  filters: {
    read?: boolean;
    limit?: number;
    offset?: number;
  } = {}
) => {
  const where: Record<string, unknown> = { userId };
  if (filters.read !== undefined) where.read = filters.read;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 20,
      skip: filters.offset || 0,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    limit: filters.limit || 20,
    offset: filters.offset || 0,
  };
};

/**
 * Marks a single notification as read
 */
export const markAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new AppError('Notification not found', 404);
  if (notification.userId !== userId) throw new AppError('Unauthorized', 403);

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

/**
 * Marks all notifications as read for a user
 */
export const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return { updated: result.count };
};

/**
 * Deletes a single notification
 */
export const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new AppError('Notification not found', 404);
  if (notification.userId !== userId) throw new AppError('Unauthorized', 403);

  await prisma.notification.delete({ where: { id: notificationId } });
  return { message: 'Notification deleted' };
};
