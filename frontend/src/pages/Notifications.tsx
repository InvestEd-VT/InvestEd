import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageShell } from '@/components/layout/PageShell';
import { notificationService } from '@/services';
import { notificationEvents } from '@/utils/notificationEvents';
import type { Notification } from '@/types';

const ITEMS_PER_PAGE = 10;

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'TRADE_EXECUTED':
      return 'bg-green-50';
    case 'OPTION_EXERCISED':
      return 'bg-blue-50';
    case 'OPTION_EXPIRED':
      return 'bg-orange-50';
    case 'OPTION_EXPIRING_SOON':
      return 'bg-yellow-50';
    case 'PORTFOLIO_RESET':
      return 'bg-red-50';
    default:
      return 'bg-gray-50';
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'TRADE_EXECUTED':
      return 'secondary';
    case 'OPTION_EXERCISED':
      return 'default';
    case 'OPTION_EXPIRED':
      return 'outline';
    case 'OPTION_EXPIRING_SOON':
      return 'outline';
    case 'PORTFOLIO_RESET':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getTypeLabel = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const fetchNotifications = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const read = filter === 'all' ? undefined : filter === 'read';
      const offset = (page - 1) * ITEMS_PER_PAGE;

      const response = await notificationService.getNotifications({
        read,
        limit: ITEMS_PER_PAGE,
        offset,
      });

      setNotifications(response.notifications);
      setTotalCount(response.total);
      setCurrentPage(page);
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [filter]);

  useEffect(() => {
    setFilteredNotifications(notifications);
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      notificationEvents.emit();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      notificationEvents.emit();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const ids = Array.from(selectedNotifications);
      await Promise.all(ids.map((id) => notificationService.deleteNotification(id)));
      setNotifications((prev) => prev.filter((n) => !selectedNotifications.has(n.id)));
      setTotalCount((prev) => Math.max(0, prev - ids.length));
      setSelectedNotifications(new Set());
      notificationEvents.emit();
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(currentPage);
      notificationEvents.emit();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const toggleNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const toggleAllNotifications = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n) => n.id)));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {totalCount} notification{totalCount !== 1 ? 's' : ''}
              {unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center justify-between gap-4">
          <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          {selectedNotifications.size > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedNotifications.size})
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {filter === 'all'
                ? 'No notifications yet'
                : filter === 'unread'
                  ? 'No unread notifications'
                  : 'No read notifications'}
            </div>
          ) : (
            <>
              {/* Select All Row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg font-medium text-sm">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === notifications.length}
                  onChange={toggleAllNotifications}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">
                  {selectedNotifications.size === 0
                    ? 'Select All'
                    : `${selectedNotifications.size} Selected`}
                </span>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer ${getNotificationColor(
                    notification.type
                  )}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleNotification(notification.id);
                    }}
                    className="w-4 h-4 rounded border-gray-300 mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          <Badge variant={getTypeBadgeVariant(notification.type)}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-gray-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          title="Delete"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchNotifications(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchNotifications(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
