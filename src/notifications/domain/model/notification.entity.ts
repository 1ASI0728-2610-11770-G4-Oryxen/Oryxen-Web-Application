export enum NotificationType {
  CriticalHealth = 1,
  HighAnomalies = 2,
  WateringReminder = 3,
  SystemUpdate = 4,
}

export enum NotificationChannel {
  InApp = 1,
  Email = 2,
  Push = 3,
}

export interface Notification {
  id: string;
  userId: string;
  plantId: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sentAt: string | null;
}

export interface UnreadCount {
  count: number;
}
