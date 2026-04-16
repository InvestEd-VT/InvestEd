import { Router } from 'express';
import * as notificationController from '../../controllers/notification.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/v1/notifications
 * @access Private
 * Returns notifications for the authenticated user
 * @query read - Filter by read status (true/false)
 * @query limit, offset - Pagination
 */
router.get('/', authMiddleware, notificationController.getNotifications);

/**
 * PATCH /api/v1/notifications/read-all
 * @access Private
 * Marks all notifications as read
 */
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

/**
 * PATCH /api/v1/notifications/:id/read
 * @access Private
 * Marks a single notification as read
 */
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

/**
 * DELETE /api/v1/notifications/:id
 * @access Private
 * Deletes a single notification
 */
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

export default router;
