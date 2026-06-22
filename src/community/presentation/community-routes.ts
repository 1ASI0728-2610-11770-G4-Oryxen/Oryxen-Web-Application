import type { RouteRecordRaw } from 'vue-router';

const communityRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Community',
    component: () => import('@/community/presentation/views/CommunityView.vue'),
  },
];

export default communityRoutes;
