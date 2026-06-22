import type { RouteRecordRaw } from 'vue-router';

const aiRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'DiagnosisHome',
    component: () => import('@/ai/presentation/views/DiagnosisView.vue'),
  },
];

export default aiRoutes;
