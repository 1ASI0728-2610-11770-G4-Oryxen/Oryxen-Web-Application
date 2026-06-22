import type { RouteRecordRaw } from 'vue-router';

const billingRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Pricing',
    component: () => import('@/billing/presentation/views/PricingView.vue'),
  },
  {
    path: 'checkout',
    name: 'Checkout',
    component: () => import('@/billing/presentation/views/CheckoutView.vue'),
  },
];

export default billingRoutes;
