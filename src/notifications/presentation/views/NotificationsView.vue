<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from '@/notifications/application/notification.store';
import { NotificationType } from '@/notifications/domain/model/notification.entity';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

const { t } = useI18n();
const store = useNotificationStore();
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    await store.fetchAll();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load notifications';
  } finally {
    loading.value = false;
  }
});

const sorted = computed(() => [...store.list].sort((a, b) => +b.isRead - +a.isRead));

const typeMeta: Record<NotificationType, { severity: 'error' | 'warn' | 'info' | 'success' }> = {
  [NotificationType.CriticalHealth]: { severity: 'error' },
  [NotificationType.HighAnomalies]:   { severity: 'warn' },
  [NotificationType.WateringReminder]: { severity: 'info' },
  [NotificationType.SystemUpdate]:     { severity: 'success' },
};

function typeLabel(t: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    [NotificationType.CriticalHealth]:   t('notifications.typeCriticalHealth'),
    [NotificationType.HighAnomalies]:    t('notifications.typeHighAnomalies'),
    [NotificationType.WateringReminder]: t('notifications.typeWateringReminder'),
    [NotificationType.SystemUpdate]:     t('notifications.typeSystemUpdate'),
  };
  return labels[t] ?? 'Unknown';
}

async function handleMarkRead(id: string) {
  await store.markAsRead(id);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
</script>

<template>
  <div class="notifications-page" role="main" aria-labelledby="notifications-title">
    <header class="notifications-page__header">
      <h1 id="notifications-title">{{ t('notifications.title') }}</h1>
      <span class="notifications-page__badge" v-if="store.unreadCount > 0" aria-live="polite">
        {{ store.unreadCount }} {{ t('notifications.unread') }}
      </span>
    </header>

    <div v-if="loading" class="notifications-page__loading" role="status" aria-live="polite">
      <ProgressSpinner />
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="notifications-page__error">
      <p>{{ error }}</p>
      <Button :label="t('common.retry')" @click="onMounted" />
    </div>

    <div v-else-if="sorted.length === 0" class="notifications-page__empty">
      <p>{{ t('notifications.empty') }}</p>
    </div>

    <div v-else class="notifications-page__list" role="list">
      <div
        v-for="n in sorted"
        :key="n.id"
        :class="['notifications-page__item', { 'notifications-page__item--unread': !n.isRead }]"
        role="listitem"
      >
        <div class="notifications-page__item-header">
          <Tag
            :value="typeLabel(n.type)"
            :severity="typeMeta[n.type]?.severity ?? 'info'"
          />
          <small class="notifications-page__date">{{ formatDate(n.createdAt) }}</small>
        </div>
        <h3 class="notifications-page__item-title">{{ n.title }}</h3>
        <p class="notifications-page__item-message">{{ n.message }}</p>
        <Button
          v-if="!n.isRead"
          :label="t('notifications.markRead')"
          size="small"
          text
          @click="handleMarkRead(n.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.notifications-page__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.notifications-page__header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
}

.notifications-page__badge {
  background: var(--primary-green, #22c55e);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.notifications-page__loading,
.notifications-page__empty,
.notifications-page__error {
  text-align: center;
  padding: 3rem;
}

.notifications-page__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notifications-page__item {
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition: box-shadow 0.2s ease;
}

.notifications-page__item--unread {
  border-left: 4px solid var(--primary-green, #22c55e);
  background: var(--primary-green-light, #f0fdf4);
}

.notifications-page__item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notifications-page__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notifications-page__date {
  color: var(--text-secondary, #6b7280);
  font-size: 0.8rem;
}

.notifications-page__item-title {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  font-weight: 700;
}

.notifications-page__item-message {
  margin: 0 0 0.5rem;
  color: var(--text-secondary, #6b7280);
  font-size: 0.9rem;
}
</style>
