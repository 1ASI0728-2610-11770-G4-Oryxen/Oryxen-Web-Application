import { createRouter, createWebHistory } from 'vue-router';
import analyticsRoutes from './analytics/presentation/analytics-routes';
import plantmanagementRoutes from './plants/presentation/plants-routes.ts';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: { name: 'Dashboard' }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('./shared/presentation/components/Dashboard.vue'),
        },
        {
            path: '/plants',
            component: () => import('./plants/presentation/views/PlantsLayout.vue'),
            children: [
                {
                    path: '',
                    redirect: { name: 'PlantsList' }
                },
                ...plantmanagementRoutes
            ]
        },
        {
            path: '/analytics',
            name: 'Analytics',
            component: () => import('./analytics/presentation/views/Analytics.vue'),
            children: analyticsRoutes
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('./shared/presentation/components/Settings.vue'),
        },
    ]
});

export default router;