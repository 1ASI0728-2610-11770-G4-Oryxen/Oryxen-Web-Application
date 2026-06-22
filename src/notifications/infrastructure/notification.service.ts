import { apiClient } from '@/services/httpClient';
import type { Notification, UnreadCount } from '@/notifications/domain/model/notification.entity';

export class NotificationService {
  async getByUser(): Promise<Notification[]> {
    const { data } = await apiClient.get('/notifications');
    return data;
  }

  async getUnreadCount(): Promise<UnreadCount> {
    const { data } = await apiClient.get('/notifications/unread/count');
    return data;
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }
}

export const notificationService = new NotificationService();
