<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore } from '@/stores/auth';
import { telemetryService } from '@/services/telemetryService';
import { type TelemetryReading, toHealthStatus } from '@/types/telemetry';
import TelemetryCard from '@/components/telemetry/TelemetryCard.vue';

const auth = useAuthStore();

const DEMO_PLANT_KEY = 'oryxen.demoPlantId';
const plantId = ref(localStorage.getItem(DEMO_PLANT_KEY) ?? crypto.randomUUID());
localStorage.setItem(DEMO_PLANT_KEY, plantId.value);

const readings = ref<TelemetryReading[]>([]);
const loading = ref(false);
const sending = ref(false);
const errorMessage = ref('');

const latest = computed<TelemetryReading | null>(() => readings.value[0] ?? null);
const latestStatus = computed(() => (latest.value ? toHealthStatus(latest.value.healthScore) : null));
const statusLabel = computed(() =>
  latestStatus.value
    ? { critical: 'Critical', warning: 'Warning', good: 'Good', optimal: 'Optimal' }[latestStatus.value]
    : '',
);

async function loadReadings(): Promise<void> {
  errorMessage.value = '';
  loading.value = true;
  try {
    readings.value = await telemetryService.getByPlant(plantId.value);
  } catch (error) {
    errorMessage.value = resolveError(error);
  } finally {
    loading.value = false;
  }
}

async function sendTestReading(): Promise<void> {
  sending.value = true;
  errorMessage.value = '';
  try {
    await telemetryService.ingest({
      deviceId: 'SL-WEB-DEMO',
      plantId: plantId.value,
      humidity: random(35, 70),
      temperature: random(16, 30),
      lightLevel: random(200, 1200),
      soilMoisture: random(15, 80),
    });
    await loadReadings();
  } catch (error) {
    errorMessage.value = resolveError(error);
  } finally {
    sending.value = false;
  }
}

function random(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function resolveError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401) return 'Your session expired. Please sign in again.';
    const title = (error.response?.data as { title?: string } | undefined)?.title;
    if (title) return title;
  }
  return 'Could not reach the Oryxen API. Make sure the backend is running on localhost:5170.';
}

onMounted(loadReadings);
</script>

<template>
  <section class="dashboard">
    <div class="dashboard__head">
      <div>
        <h1 class="dashboard__title">Plant Telemetry</h1>
        <p class="dashboard__subtitle">
          Live readings from your Sensor Lite devices ·
          <span class="dashboard__role">{{ auth.roles.join(', ') }}</span>
        </p>
      </div>
    </div>

    <div class="dashboard__controls">
      <label class="dashboard__plant">
        <span class="dashboard__plant-label">Plant ID</span>
        <InputText v-model="plantId" class="dashboard__plant-input" />
      </label>
      <Button
        label="Send test reading"
        icon="pi pi-send"
        severity="secondary"
        :loading="sending"
        @click="sendTestReading"
      />
      <Button label="Refresh" icon="pi pi-refresh" :loading="loading" @click="loadReadings" />
    </div>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <div v-if="latest" class="dashboard__summary" :class="`dashboard__summary--${latestStatus}`">
      <div class="dashboard__summary-score">
        <span class="dashboard__summary-value">{{ latest.healthScore }}</span>
        <span class="dashboard__summary-unit">/ 100</span>
      </div>
      <div class="dashboard__summary-meta">
        <span class="dashboard__summary-status">{{ statusLabel }}</span>
        <span class="dashboard__summary-hint">Latest health score</span>
      </div>
    </div>

    <div v-if="loading && readings.length === 0" class="dashboard__placeholder">
      <ProgressSpinner style="width: 42px; height: 42px" stroke-width="4" />
    </div>

    <p v-else-if="readings.length === 0" class="dashboard__placeholder">
      No readings yet. Click <strong>Send test reading</strong> to simulate a Sensor Lite device.
    </p>

    <div v-else class="dashboard__grid">
      <TelemetryCard v-for="reading in readings" :key="reading.id" :reading="reading" />
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 70rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard__title {
  font-size: 1.6rem;
  color: var(--oryxen-accent);
}

.dashboard__subtitle {
  color: var(--oryxen-muted);
  font-size: 0.9rem;
}

.dashboard__role {
  font-weight: 700;
  color: var(--oryxen-primary-strong);
}

.dashboard__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.8rem;
}

.dashboard__plant {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 16rem;
}

.dashboard__plant-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--oryxen-muted);
}

.dashboard__plant-input {
  width: 100%;
  font-family: monospace;
}

.dashboard__summary {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--oryxen-card);
  border: 1px solid var(--oryxen-border);
  border-left-width: 8px;
  border-radius: 1rem;
  padding: 1.4rem 1.8rem;
}

.dashboard__summary--critical { border-left-color: var(--oryxen-critical); }
.dashboard__summary--warning { border-left-color: var(--oryxen-warning); }
.dashboard__summary--good { border-left-color: var(--oryxen-good); }
.dashboard__summary--optimal { border-left-color: var(--oryxen-optimal); }

.dashboard__summary-score {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.dashboard__summary-value {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}

.dashboard__summary-unit {
  color: var(--oryxen-muted);
}

.dashboard__summary-meta {
  display: flex;
  flex-direction: column;
}

.dashboard__summary-status {
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard__summary-hint {
  font-size: 0.8rem;
  color: var(--oryxen-muted);
}

.dashboard__placeholder {
  text-align: center;
  color: var(--oryxen-muted);
  padding: 2.5rem 1rem;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
}
</style>
