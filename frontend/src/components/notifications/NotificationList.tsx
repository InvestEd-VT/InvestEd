import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'TRADE_EXECUTED':
      return 'bg-green-50 border-l-4 border-green-500';
    case 'OPTION_EXERCISED':
      return 'bg-blue-50 border-l-4 border-blue-500';
    case 'OPTION_EXPIRED':
      return 'bg-orange-50 border-l-4 border-orange-500';
    case 'OPTION_EXPIRING_SOON':
      return 'bg-yellow-50 border-l-4 border-yellow-500';
    case 'PORTFOLIO_RESET':
      return 'bg-red-50 border-l-4 border-red-500';
    default:
      return 'bg-gray-50 border-l-4 border-gray-500';
  }
};

const getTypeLabel = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export function NotificationList({ notifications, onMarkAsRead, onDelete }: NotificationListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 hover:bg-opacity-75 transition-colors cursor-pointer ${getNotificationColor(
            notification.type
          )}`}
          onClick={() => !notification.read && onMarkAsRead(notification.id)}
        >
          <div className="flex items-start gap-3">
            {!notification.read && (
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                <span className="text-xs text-gray-500">{getTypeLabel(notification.type)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
              <span className="text-xs text-gray-500 mt-1 block">
                {formatTime(notification.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                title="Delete notification"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
