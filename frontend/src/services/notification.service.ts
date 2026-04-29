import api from './api';
import type { Notification, NotificationsResponse } from '../types';

const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: (filters?: {
    read?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();
    if (filters?.read !== undefined) params.append('read', String(filters.read));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const queryString = params.toString();
    return api
      .get(`/notifications${queryString ? `?${queryString}` : ''}`)
      .then((response) => response.data);
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: (notificationId: string): Promise<Notification> =>
    api.patch(`/notifications/${notificationId}/read`).then((response) => response.data),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: (): Promise<{ updated: number }> =>
    api.patch('/notifications/read-all').then((response) => response.data),

  /**
   * Delete a single notification
   */
  deleteNotification: (notificationId: string): Promise<{ message: string }> =>
    api.delete(`/notifications/${notificationId}`).then((response) => response.data),

  /**
   * Get unread count
   */
  getUnreadCount: (): Promise<{ unreadCount: number }> =>
    api
      .get('/notifications?limit=1&offset=0')
      .then((response) => ({ unreadCount: response.data.unreadCount })),
};

export default notificationService;
