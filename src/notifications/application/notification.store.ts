import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notificationService } from '@/notifications/infrastructure/notification.service';
import type { Notification } from '@/notifications/domain/model/notification.entity';

export const useNotificationStore = defineStore('notifications', () => {
  const list = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      list.value = await notificationService.getByUser();
    } finally {
      loading.value = false;
    }
  }

  async function fetchUnreadCount() {
    try {
      const result = await notificationService.getUnreadCount();
      unreadCount.value = result.count;
    } catch {
      unreadCount.value = 0;
    }
  }

  async function markAsRead(id: string) {
    await notificationService.markAsRead(id);
    const notification = list.value.find((n) => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    if (unreadCount.value > 0) {
      unreadCount.value--;
    }
  }

  return { list, unreadCount, loading, fetchAll, fetchUnreadCount, markAsRead };
});
