<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnalyticsStore } from '../../application/analytics.store';
import { PlantsService } from '../../../plants/infrastructure/plants.services';
import type { Plant } from '../../../plants/domain/model/plants.entity';
import type { PlantTrendResponse } from '../../domain/model/analytics.entity';
import { AnalyticsAssembler } from '../../infrastructure/assembler/analytics-assembler';

const { t } = useI18n();
const store = useAnalyticsStore();
const plantsService = new PlantsService();

const selectedPlantId = ref<string | null>(null);
const selectedTrends = ref<PlantTrendResponse | null>(null);
const selectedTimeRange = ref<'daily' | 'weekly' | 'monthly'>('daily');
const plants = ref<Plant[]>([]);
const loadingPlants = ref(false);

const trendPoints = computed(() => {
  if (!selectedTrends.value) return [];
  const data = selectedTrends.value[selectedTimeRange.value];
  return data ?? [];
});

const healthChartData = computed(() => {
  if (!selectedTrends.value) return [];
  return selectedTrends.value.daily.map((p) => ({
    day: p.label,
    value: p.avgHealthScore,
  }));
});

const humidityChartData = computed(() => {
  if (!selectedTrends.value) return [];
  return selectedTrends.value.daily.map((p) => ({
    day: p.label,
    value: p.avgHumidity,
  }));
});

const temperatureChartData = computed(() => {
  if (!selectedTrends.value) return [];
  return selectedTrends.value.daily.map((p) => ({
    day: p.label,
    value: p.avgTemperature,
  }));
});

const healthSvgPoints = computed(() => {
  const data = healthChartData.value;
  if (!data.length) return '25,90';
  const max = Math.max(...data.map((d) => d.value), 1);
  return data.map((p, i) => `${i * 50 + 25},${180 - (p.value / max) * 150}`).join(' ');
});

const healthSvgArea = computed(() => {
  const pts = healthSvgPoints.value;
  if (pts === '25,90') return '25,180 25,180';
  return `25,180 ${pts} ${(healthChartData.value.length - 1) * 50 + 25},180`;
});

const humiditySvgPoints = computed(() => {
  const data = humidityChartData.value;
  if (!data.length) return '25,90';
  return data.map((p, i) => `${i * 50 + 25},${180 - p.value * 1.5}`).join(' ');
});

const humiditySvgArea = computed(() => {
  const pts = humiditySvgPoints.value;
  if (pts === '25,90') return '25,180 25,180';
  return `25,180 ${pts} ${(humidityChartData.value.length - 1) * 50 + 25},180`;
});

const temperatureSvgPoints = computed(() => {
  const data = temperatureChartData.value;
  if (!data.length) return '25,90';
  const maxT = Math.max(...data.map((d) => d.value), 1);
  return data.map((p, i) => `${i * 50 + 25},${180 - (p.value / maxT) * 150}`).join(' ');
});

const temperatureSvgArea = computed(() => {
  const pts = temperatureSvgPoints.value;
  if (pts === '25,90') return '25,180 25,180';
  return `25,180 ${pts} ${(temperatureChartData.value.length - 1) * 50 + 25},180`;
});

async function loadPlants(): Promise<void> {
  loadingPlants.value = true;
  try {
    const response = await plantsService.getPlantsByUser();
    plants.value = response.data;
    if (!selectedPlantId.value && plants.value.length > 0) {
      selectedPlantId.value = plants.value[0].id;
    }
  } catch {
    plants.value = [];
  } finally {
    loadingPlants.value = false;
  }
}

async function onPlantSelect(): Promise<void> {
  if (!selectedPlantId.value) {
    selectedTrends.value = null;
    return;
  }
  const trends = await store.fetchPlantTrends(selectedPlantId.value);
  selectedTrends.value = trends;
}

onMounted(async () => {
  await Promise.all([store.fetchDashboard(), loadPlants()]);
  if (selectedPlantId.value) {
    await onPlantSelect();
  }
});

watch(selectedPlantId, onPlantSelect);
</script>

<template>
  <div class="analytics-container" role="region" :aria-label="t('analytics.title')">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1 class="title">{{ t('analytics.title') }}</h1>
        <p class="subtitle">{{ t('analytics.subtitle') }}</p>
      </div>
      <div class="date-badge">{{ t('analytics.last30Days') }}</div>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading-state" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p>{{ t('analytics.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-state card" role="alert">
      <div class="error-icon"><i class="pi pi-exclamation-circle"></i></div>
      <h3>{{ t('analytics.errorTitle') }}</h3>
      <p>{{ store.error }}</p>
      <button class="retry-button" :aria-label="t('analytics.retry')" @click="store.fetchDashboard()">
        <i class="pi pi-refresh"></i> {{ t('analytics.retry') }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!store.hasData" class="empty-state card">
      <div class="empty-icon"><i class="pi pi-chart-line"></i></div>
      <h3>{{ t('analytics.emptyTitle') }}</h3>
      <p>{{ t('analytics.emptyText') }}</p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="card stats-card">
          <div class="card-content">
            <div class="stats-info">
              <p class="stats-label">{{ t('analytics.totalPlants') }}</p>
              <p class="stats-value">{{ store.dashboard?.totalPlants ?? 0 }}</p>
              <p class="stats-trend positive">{{ t('analytics.monitored') }}</p>
            </div>
            <div class="icon-container green"><i class="pi pi-leaf"></i></div>
          </div>
        </div>
        <div class="card stats-card">
          <div class="card-content">
            <div class="stats-info">
              <p class="stats-label">{{ t('analytics.healthyPlants') }}</p>
              <p class="stats-value">{{ store.dashboard?.healthyPlants ?? 0 }}</p>
              <p class="stats-trend positive">
                {{ store.dashboard ? Math.round((store.dashboard.healthyPlants / Math.max(store.dashboard.totalPlants, 1)) * 100) : 0 }}% {{ t('analytics.healthRate') }}
              </p>
            </div>
            <div class="icon-container green"><i class="pi pi-heart"></i></div>
          </div>
        </div>
        <div class="card stats-card">
          <div class="card-content">
            <div class="stats-info">
              <p class="stats-label">{{ t('analytics.avgHumidity') }}</p>
              <p class="stats-value">{{ store.dashboard?.avgHumidity.toFixed(1) ?? 0 }}%</p>
              <p class="stats-trend positive">{{ t('analytics.ambientLevel') }}</p>
            </div>
            <div class="icon-container blue"><i class="pi pi-cloud"></i></div>
          </div>
        </div>
        <div class="card stats-card">
          <div class="card-content">
            <div class="stats-info">
              <p class="stats-label">{{ t('analytics.avgSoilMoisture') }}</p>
              <p class="stats-value">{{ store.dashboard?.avgSoilMoisture.toFixed(1) ?? 0 }}%</p>
              <p class="stats-trend positive">{{ store.dashboard?.totalReadings ?? 0 }} {{ t('analytics.readings') }}</p>
            </div>
            <div class="icon-container green"><i class="pi pi-ticket"></i></div>
          </div>
        </div>
        <div class="card stats-card">
          <div class="card-content">
            <div class="stats-info">
              <p class="stats-label">{{ t('analytics.needAttention') }}</p>
              <p class="stats-value">{{ (store.dashboard?.warningPlants ?? 0) + (store.dashboard?.criticalPlants ?? 0) }}</p>
              <p class="stats-trend negative">{{ t('analytics.reviewRequired') }}</p>
            </div>
            <div class="icon-container orange"><i class="pi pi-exclamation-triangle"></i></div>
          </div>
        </div>
      </div>

      <!-- Plant selector for trends -->
      <div class="card plant-selector-card">
        <div class="chart-header">
          <h3 class="chart-title">{{ t('analytics.plantTrends') }}</h3>
          <select
            v-model="selectedPlantId"
            class="plant-select"
            :aria-label="t('analytics.selectPlant')"
            :disabled="loadingPlants"
            @change="onPlantSelect"
          >
            <option v-for="p in plants" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <!-- Time range tabs -->
        <div class="time-tabs" role="tablist" :aria-label="t('analytics.timeRange')">
          <button
            v-for="range in (['daily', 'weekly', 'monthly'] as const)"
            :key="range"
            role="tab"
            :aria-selected="selectedTimeRange === range"
            :aria-label="t(`analytics.${range}`)"
            class="time-tab"
            :class="{ active: selectedTimeRange === range }"
            @click="selectedTimeRange = range"
          >
            {{ t(`analytics.${range}`) }}
          </button>
        </div>

        <!-- Trend metrics -->
        <div v-if="trendPoints.length" class="charts-grid">
          <!-- Health Score Chart -->
          <div class="card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">{{ t('analytics.healthScoreTrend') }}</h4>
            </div>
            <div class="chart-container line-chart">
              <svg class="line-svg" viewBox="0 0 350 180" aria-label="Health score trend chart" role="img">
                <defs>
                  <linearGradient id="healthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <polygon :points="healthSvgArea" fill="url(#healthGrad)" />
                <polyline :points="healthSvgPoints" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <circle v-for="(pt, i) in healthChartData" :key="i"
                  :cx="i * 50 + 25" :cy="180 - (pt.value / Math.max(...healthChartData.map(d => d.value), 1)) * 150"
                  r="4" fill="#22c55e" stroke="#ffffff" stroke-width="2" />
              </svg>
              <div class="chart-labels">
                <span v-for="(pt, i) in trendPoints" :key="i" class="day-label">{{ pt.label }}</span>
              </div>
            </div>
          </div>

          <!-- Humidity Chart -->
          <div class="card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">{{ t('analytics.humidityTrend') }}</h4>
            </div>
            <div class="chart-container line-chart">
              <svg class="line-svg" viewBox="0 0 350 180" aria-label="Humidity trend chart" role="img">
                <defs>
                  <linearGradient id="humGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <polygon :points="humiditySvgArea" fill="url(#humGrad)" />
                <polyline :points="humiditySvgPoints" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <circle v-for="(pt, i) in humidityChartData" :key="i"
                  :cx="i * 50 + 25" :cy="180 - pt.value * 1.5"
                  r="4" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />
              </svg>
              <div class="chart-labels">
                <span v-for="(pt, i) in trendPoints" :key="i" class="day-label">{{ pt.label }}</span>
              </div>
            </div>
          </div>

          <!-- Temperature Chart -->
          <div class="card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">{{ t('analytics.temperatureTrend') }}</h4>
            </div>
            <div class="chart-container line-chart">
              <svg class="line-svg" viewBox="0 0 350 180" aria-label="Temperature trend chart" role="img">
                <defs>
                  <linearGradient id="tempGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f97316;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#f97316;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <polygon :points="temperatureSvgArea" fill="url(#tempGrad)" />
                <polyline :points="temperatureSvgPoints" fill="none" stroke="#f97316" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <circle v-for="(pt, i) in temperatureChartData" :key="i"
                  :cx="i * 50 + 25" :cy="180 - (pt.value / Math.max(...temperatureChartData.map(d => d.value), 1)) * 150"
                  r="4" fill="#f97316" stroke="#ffffff" stroke-width="2" />
              </svg>
              <div class="chart-labels">
                <span v-for="(pt, i) in trendPoints" :key="i" class="day-label">{{ pt.label }}</span>
              </div>
            </div>
          </div>

          <!-- Metrics Summary Table -->
          <div class="card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">{{ t('analytics.metricsSummary') }}</h4>
            </div>
            <div class="metrics-table">
              <div class="metric-row" v-for="pt in trendPoints" :key="pt.label">
                <span class="metric-label-col">{{ pt.label }}</span>
                <span class="metric-val health">{{ pt.avgHealthScore.toFixed(1) }}</span>
                <span class="metric-val moisture">{{ pt.avgSoilMoisture.toFixed(1) }}%</span>
                <span class="metric-val temp">{{ pt.avgTemperature.toFixed(1) }}&deg;C</span>
                <span class="metric-val hum">{{ pt.avgHumidity.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- No trends -->
        <div v-else class="chart-empty">
          <i class="pi pi-info-circle"></i>
          <span>{{ t('analytics.noTrendData') }}</span>
        </div>
      </div>

      <!-- Plant health distribution -->
      <div class="card chart-card plant-distribution">
        <div class="chart-header">
          <h3 class="chart-title">{{ t('analytics.healthDistribution') }}</h3>
        </div>
        <div class="chart-container pie-chart">
          <div class="pie-chart-wrapper">
            <svg viewBox="0 0 100 100" class="pie-svg" aria-label="Plant health distribution pie chart" role="img">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#86efac" stroke-width="12"
                :stroke-dasharray="`${store.dashboard ? Math.round((store.dashboard.healthyPlants / Math.max(store.dashboard.totalPlants, 1)) * 100) : 0} 100`" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#fbbf24" stroke-width="12"
                :stroke-dasharray="`${store.dashboard ? Math.round((store.dashboard.warningPlants / Math.max(store.dashboard.totalPlants, 1)) * 100) : 0} 100`"
                :stroke-dashoffset="`${store.dashboard ? -Math.round((store.dashboard.healthyPlants / Math.max(store.dashboard.totalPlants, 1)) * 100) : 0}`" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#ef4444" stroke-width="12"
                :stroke-dasharray="`${store.dashboard ? Math.round((store.dashboard.criticalPlants / Math.max(store.dashboard.totalPlants, 1)) * 100) : 0} 100`"
                :stroke-dashoffset="`${store.dashboard ? -(Math.round((store.dashboard.healthyPlants / Math.max(store.dashboard.totalPlants, 1)) * 100) + Math.round((store.dashboard.warningPlants / Math.max(store.dashboard.totalPlants, 1)) * 100)) : 0}`" />
            </svg>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot green"></div><span>{{ t('analytics.healthy') }} ({{ store.dashboard?.healthyPlants ?? 0 }})</span></div>
          <div class="legend-item"><div class="legend-dot yellow"></div><span>{{ t('analytics.warning') }} ({{ store.dashboard?.warningPlants ?? 0 }})</span></div>
          <div class="legend-item"><div class="legend-dot red"></div><span>{{ t('analytics.critical') }} ({{ store.dashboard?.criticalPlants ?? 0 }})</span></div>
        </div>
      </div>

      <!-- Plant summaries list -->
      <div class="card chart-card">
        <div class="chart-header">
          <h3 class="chart-title">{{ t('analytics.plantSummaryList') }}</h3>
        </div>
        <div class="plant-list">
          <div v-for="s in store.plantSummaries" :key="s.plantId" class="plant-item">
            <div class="plant-item-status" :class="s.status" :aria-label="t(`analytics.status.${s.status}`)"></div>
            <div class="plant-item-info">
              <strong>{{ s.plantName }}</strong>
              <span class="plant-item-type">{{ s.plantType }}</span>
            </div>
            <div class="plant-item-metrics">
              <span>{{ t('analytics.healthLabel') }}: {{ s.avgHealthScore.toFixed(0) }}</span>
              <span>{{ t('analytics.soilLabel') }}: {{ s.avgSoilMoisture.toFixed(0) }}%</span>
              <span>{{ t('analytics.readingsLabel') }}: {{ s.readingCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analytics-container { min-height: 100vh; background-color: #f9fafb; padding: 1.5rem; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; }
.spinner { width: 3rem; height: 3rem; border: 4px solid #e5e7eb; border-top-color: #22c55e; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state p { color: #6b7280; }
.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; gap: 1rem; }
.error-icon { width: 4rem; height: 4rem; border-radius: 50%; background-color: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
.error-state h3 { font-size: 1.25rem; color: #111827; margin: 0; }
.error-state p { color: #6b7280; margin: 0; max-width: 400px; }
.retry-button { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background-color: #22c55e; color: white; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
.retry-button:hover { background-color: #16a34a; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; gap: 1rem; }
.empty-icon { width: 5rem; height: 5rem; border-radius: 50%; background-color: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
.empty-state h3 { font-size: 1.25rem; color: #111827; margin: 0; }
.empty-state p { color: #6b7280; margin: 0; max-width: 400px; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.header-content { flex: 1; }
.title { font-size: 1.5rem; font-weight: bold; color: #111827; margin: 0; }
.subtitle { color: #6b7280; margin: 0.25rem 0 0 0; font-size: 0.875rem; }
.date-badge { padding: 0.5rem 1rem; background-color: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.875rem; color: #374151; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.card { background-color: white; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.stats-card .card-content { display: flex; align-items: center; justify-content: space-between; }
.stats-info { flex: 1; }
.stats-label { font-size: 0.875rem; color: #6b7280; margin: 0 0 0.25rem 0; }
.stats-value { font-size: 1.875rem; font-weight: bold; color: #111827; margin: 0; }
.stats-trend { font-size: 0.875rem; margin: 0.25rem 0 0 0; }
.stats-trend.positive { color: #059669; }
.stats-trend.negative { color: #dc2626; }
.icon-container { width: 3rem; height: 3rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.icon-container.green { background-color: #dcfce7; color: #059669; }
.icon-container.blue { background-color: #dbeafe; color: #2563eb; }
.icon-container.orange { background-color: #fed7aa; color: #ea580c; }
.plant-selector-card { margin-bottom: 1.5rem; }
.plant-select { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.875rem; color: #374151; background: white; min-width: 200px; }
.time-tabs { display: flex; gap: 0.5rem; margin: 1rem 0; }
.time-tab { padding: 0.5rem 1.25rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: white; color: #6b7280; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
.time-tab.active { background: #22c55e; color: white; border-color: #22c55e; }
.time-tab:hover:not(.active) { background: #f3f4f6; }
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
.chart-card { min-height: 300px; }
.chart-header { margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
.chart-title { font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; }
.chart-container { height: 200px; position: relative; }
.line-chart { height: 200px; }
.line-svg { width: 100%; height: 100%; }
.chart-labels { display: flex; justify-content: space-between; margin-top: 0.5rem; padding: 0 0.5rem; }
.day-label { font-size: 0.75rem; color: #6b7280; font-weight: 500; }
.pie-chart { display: flex; align-items: center; justify-content: center; height: 150px; }
.pie-chart-wrapper { width: 8rem; height: 8rem; }
.pie-svg { transform: rotate(-90deg); }
.legend { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151; }
.legend-dot { width: 0.75rem; height: 0.75rem; border-radius: 50%; }
.legend-dot.green { background-color: #86efac; }
.legend-dot.yellow { background-color: #fbbf24; }
.legend-dot.red { background-color: #ef4444; }
.metrics-table { display: flex; flex-direction: column; gap: 0.5rem; }
.metric-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; }
.metric-label-col { width: 80px; font-weight: 600; color: #374151; }
.metric-val { padding: 0.15rem 0.5rem; border-radius: 0.25rem; font-weight: 500; }
.metric-val.health { background-color: #dcfce7; color: #16a34a; }
.metric-val.moisture { background-color: #eff6ff; color: #2563eb; }
.metric-val.temp { background-color: #fff7ed; color: #ea580c; }
.metric-val.hum { background-color: #f0fdf4; color: #059669; }
.chart-empty { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem; color: #9ca3af; }
.plant-distribution { margin-top: 1.5rem; }
.plant-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.plant-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
.plant-item-status { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.plant-item-status.healthy { background-color: #22c55e; }
.plant-item-status.warning { background-color: #f59e0b; }
.plant-item-status.critical { background-color: #ef4444; }
.plant-item-info { flex: 1; }
.plant-item-type { display: block; font-size: 0.75rem; color: #9ca3af; }
.plant-item-metrics { display: flex; gap: 1rem; font-size: 0.8rem; color: #6b7280; }
@media (max-width: 768px) {
  .analytics-container { padding: 1rem; }
  .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .stats-grid { grid-template-columns: 1fr; }
  .charts-grid { grid-template-columns: 1fr; }
  .plant-item { flex-wrap: wrap; }
}
</style>
