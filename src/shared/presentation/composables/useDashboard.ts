import { ref, onMounted, computed } from 'vue';
import { AnalyticsService } from '../../../analytics/infrastructure/analytics.service';
import { PlantsService } from '../../../plants/infrastructure/plants.services';
import type { Plant } from '../../../plants/domain/model/plants.entity';

interface Stat {
  icon: string;
  value: string;
  label: string;
  trend: string;
  trendUp: boolean;
}

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
}

interface NextWatering {
  plantName: string;
  timeDue: string;
  location: string;
}

export function useDashboard() {
  const analyticsService = new AnalyticsService();
  const plantsService = new PlantsService();

  const loading = ref(true);
  const error = ref<string | null>(null);
  const plants = ref<Plant[]>([]);

  const analytics = computed(() =>
      plants.value
          .filter(plant => plant.metrics?.length)
          .map(plant => analyticsService.calculateAnalyticsFromMetrics(plant.id, plant.metrics, plant.metrics[0]?.deviceId))
  );

  const stats = computed<Stat[]>(() => {
    const totalPlants = plants.value.length;
    const activeAlerts = plants.value.filter(p => p.status === 'warning' || p.status === 'critical').length;
    const avgHumidity = analytics.value.length
        ? Math.round(analytics.value.reduce((sum, a) => sum + a.summary.avgHumidity, 0) / analytics.value.length)
        : 0;
    const healthyPlants = plants.value.filter(p => p.status === 'healthy').length;
    const healthScore = totalPlants ? Math.round((healthyPlants / totalPlants) * 100) : 0;

    return [
      { icon: '🌱', value: `${totalPlants}`, label: 'Total plants',   trend: '',          trendUp: true  },
      { icon: '⚠️', value: `${activeAlerts}`, label: 'Active Alerts', trend: '',          trendUp: false },
      { icon: '💧', value: `${avgHumidity}%`, label: 'Avg Humidity',  trend: '',          trendUp: true  },
      { icon: '✅', value: `${healthScore}%`, label: 'Health Score',  trend: 'Excellent', trendUp: true  },
    ];
  });

  const recentActivities = computed<Activity[]>(() =>
      plants.value.slice(0, 4).map(plant => ({
        icon: '💧',
        title: `Watered ${plant.name}`,
        description: 'Completed watering task',
        time: new Date(plant.lastWatered).toLocaleDateString(),
      }))
  );

  const nextWateringPlant = computed<NextWatering | null>(() => {
    if (!plants.value.length) return null;
    const sorted = [...plants.value].sort(
        (a, b) => new Date(a.lastWatered).getTime() - new Date(b.lastWatered).getTime()
    );
    const next = sorted[0]!;
    return {
      plantName: `🌿 ${next.name}`,
      timeDue: 'Due in 2 hours',
      location: 'Living Room',
    };
  });

  const fetchDashboardData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await plantsService.getPlantsByUser();
      plants.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard data.';
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchDashboardData);

  return {
    loading,
    error,
    stats,
    recentActivities,
    nextWateringPlant,
    handleWaterNow: () => console.log('Watering plant...'),
    handleViewAll:  () => console.log('View all activities...'),
  };
}