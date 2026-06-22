import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import analyticsRoutes from '@/analytics/presentation/analytics-routes';
import plantManagementRoutes from '@/plants/presentation/plants-routes';
import aiRoutes from '@/ai/presentation/ai-routes';
import billingRoutes from '@/billing/presentation/billing-routes';
import notificationRoutes from '@/notifications/presentation/notification-routes';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'Dashboard' } },

  // --- Auth (bare layout) ---
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  // Alias used by the reconciled Sidebar logout (`router.push({ name: 'SignIn' })`).
  { path: '/signin', name: 'SignIn', redirect: { name: 'login' } },

  // --- Public: Terms & Conditions (reachable by guests and authenticated users) ---
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/Terms.vue'),
  },

  // --- Authenticated app (sidebar + header shell) ---
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/shared/presentation/components/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    // Oryxen telemetry monitor (Phase 3 DashboardView with "Send test reading").
    path: '/telemetry',
    name: 'Telemetry',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/plants',
    component: () => import('@/plants/presentation/views/PlantsLayout.vue'),
    meta: { requiresAuth: true },
    children: [...plantManagementRoutes],
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/analytics/presentation/views/Analytics.vue'),
    meta: { requiresAuth: true },
    children: analyticsRoutes,
  },
  {
    path: '/diagnosis',
    component: () => import('@/ai/presentation/views/DiagnosisView.vue'),
    meta: { requiresAuth: true },
    children: aiRoutes,
  },
  {
    path: '/billing',
    component: () => import('@/billing/presentation/views/PricingView.vue'),
    meta: { requiresAuth: true },
    children: billingRoutes,
  },
  {
    path: '/notifications',
    component: () => import('@/notifications/presentation/views/NotificationsView.vue'),
    meta: { requiresAuth: true },
    children: notificationRoutes,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/shared/presentation/components/Settings.vue'),
    meta: { requiresAuth: true },
  },

  { path: '/:pathMatch(.*)*', redirect: { name: 'Dashboard' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'Dashboard' };
  }
  return true;
});

export default router;
