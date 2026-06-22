<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { setLocale, type AppLocale } from '@/i18n';
import { useNotificationStore } from '@/notifications/application/notification.store';

const emit = defineEmits<{ menuClick: [] }>();

const { t, locale } = useI18n();
const notificationStore = useNotificationStore();

const theme = ref<'light' | 'dark'>('light');
const isToggling = ref(false);

onMounted(() => {
  notificationStore.fetchUnreadCount();
});

const toggleTheme = () => {
  isToggling.value = true;
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme.value);
  setTimeout(() => { isToggling.value = false; }, 500);
};

const nextLocale = computed<AppLocale>(() => (locale.value === 'en' ? 'es' : 'en'));
const langLabel = computed(() => (locale.value === 'en' ? 'ES' : 'EN'));
const langAriaLabel = computed(() =>
  locale.value === 'en' ? t('header.switchToSpanish') : t('header.switchToEnglish'),
);
const toggleLanguage = () => setLocale(nextLocale.value);
</script>

<template>
  <header class="header">
    <div class="header-left">
      <Button class="menu-button" text @click="emit('menuClick')" :aria-label="t('header.menu')">
        <span class="menu-icon" aria-hidden="true">☰</span>
      </Button>
      <h1 class="greeting">{{ t('header.welcome') }} <span class="gradient-text">{{ t('common.appName') }}</span> 🌿</h1>
    </div>

    <div class="header-right">
      <Button
        class="notification-btn"
        text
        :aria-label="notificationStore.unreadCount > 0
          ? t('notifications.unreadBadgeAria', { count: notificationStore.unreadCount })
          : t('header.notifications')"
        role="status"
        :to="{ name: 'Notifications' }"
      >
        <span class="bell-icon" aria-hidden="true">🔔</span>
        <span
          v-if="notificationStore.unreadCount > 0"
          class="notification-badge"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
        </span>
      </Button>

      <Button
        class="lang-toggle"
        outlined
        @click="toggleLanguage"
        :aria-label="langAriaLabel"
      >
        <span aria-hidden="true">🌐</span>
        <span>{{ langLabel }}</span>
      </Button>

      <Button class="theme-toggle" outlined @click="toggleTheme" :aria-label="t('header.toggleTheme')">
        <span class="theme-icon" :class="{ rotating: isToggling }" aria-hidden="true">
          {{ theme === 'light' ? '🌙' : '☀️' }}
        </span>
        <span>{{ theme === 'light' ? t('header.themeDark') : t('header.themeLight') }}</span>
      </Button>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
}

.header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-green), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.header:hover::after { opacity: 0.5; }

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.menu-button {
  display: none;
  background: none !important;
  border: none !important;
  cursor: pointer;
  color: var(--text-primary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.menu-button:hover {
  background: var(--primary-green-light) !important;
  transform: scale(1.05);
}

.menu-icon {
  font-size: 24px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.menu-button:hover .menu-icon { transform: rotate(90deg); }

.greeting {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: var(--font-weight-extrabold);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.notification-btn {
  position: relative;
  background: var(--bg-primary) !important;
  border: 2px solid var(--border-color) !important;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-btn:hover {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.bell-icon {
  font-size: 20px;
  line-height: 1;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
}

.theme-toggle,
.lang-toggle {
  background: var(--bg-primary) !important;
  border: 2px solid var(--border-color) !important;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-primary) !important;
  font-weight: var(--font-weight-semibold);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon {
  display: flex;
  align-items: center;
  font-size: 18px;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.theme-icon.rotating {
  animation: rotate360 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes rotate360 {
  from { transform: rotate(0deg)   scale(1);   }
  50%  { transform: rotate(180deg) scale(1.2); }
  to   { transform: rotate(360deg) scale(1);   }
}

@media (max-width: 768px) {
  .menu-button { display: flex; }
  .greeting    { font-size: var(--font-size-lg); }
  .header      { padding: var(--spacing-md) var(--spacing-lg); }
}
</style>
