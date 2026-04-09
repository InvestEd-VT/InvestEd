// Simple event emitter for notification state changes
type NotificationEventListener = () => void;

class NotificationEvents {
  private listeners: Set<NotificationEventListener> = new Set();

  subscribe(listener: NotificationEventListener): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const notificationEvents = new NotificationEvents();
