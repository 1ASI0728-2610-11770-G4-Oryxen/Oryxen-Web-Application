import type { RouteRecordRaw } from 'vue-router';

const notificationRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Notifications',
    component: () => import('@/notifications/presentation/views/NotificationsView.vue'),
  },
];

export default notificationRoutes;
