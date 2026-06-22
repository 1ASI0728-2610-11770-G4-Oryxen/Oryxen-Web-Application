import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { analyticsService } from '../infrastructure/analytics.service';
import type {
  DashboardResponse,
  PlantTrendResponse,
  ReportListResponse,
} from '../domain/model/analytics.entity';

export const useAnalyticsStore = defineStore('analytics-v2', () => {
  const dashboard = ref<DashboardResponse | null>(null);
  const trends = ref<Map<string, PlantTrendResponse>>(new Map());
  const reports = ref<ReportListResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasData = computed(() => dashboard.value !== null && dashboard.value.totalPlants > 0);
  const plantSummaries = computed(() => dashboard.value?.plantSummaries ?? []);

  async function fetchDashboard(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      dashboard.value = await analyticsService.getDashboard();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load dashboard';
    } finally {
      loading.value = false;
    }
  }

  async function fetchPlantTrends(plantId: string): Promise<PlantTrendResponse | null> {
    try {
      const result = await analyticsService.getPlantTrends(plantId);
      trends.value.set(plantId, result);
      return result;
    } catch {
      return null;
    }
  }

  async function fetchReports(plantId?: string, page = 1): Promise<void> {
    try {
      reports.value = await analyticsService.getReports(plantId, page);
    } catch {
      reports.value = null;
    }
  }

  function reset(): void {
    dashboard.value = null;
    trends.value = new Map();
    reports.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    dashboard,
    trends,
    reports,
    loading,
    error,
    hasData,
    plantSummaries,
    fetchDashboard,
    fetchPlantTrends,
    fetchReports,
    reset,
  };
});
