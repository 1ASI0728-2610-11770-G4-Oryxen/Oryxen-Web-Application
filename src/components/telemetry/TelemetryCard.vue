<script setup lang="ts">
import { computed } from 'vue';
import { type TelemetryReading, toHealthStatus } from '@/types/telemetry';

const props = defineProps<{ reading: TelemetryReading }>();

const status = computed(() => toHealthStatus(props.reading.healthScore));

const statusLabel = computed(
  () => ({ critical: 'Critical', warning: 'Warning', good: 'Good', optimal: 'Optimal' })[status.value],
);

const recordedAtLabel = computed(() => new Date(props.reading.recordedAt).toLocaleString());
</script>

<template>
  <article class="telemetry-card" :class="`telemetry-card--${status}`">
    <header class="telemetry-card__header">
      <span class="telemetry-card__score">{{ reading.healthScore }}</span>
      <span class="telemetry-card__status">{{ statusLabel }}</span>
    </header>

    <ul class="telemetry-card__metrics">
      <li class="telemetry-card__metric">
        <i class="pi pi-cloud"></i> Humidity <strong>{{ reading.humidity }}%</strong>
      </li>
      <li class="telemetry-card__metric">
        <i class="pi pi-sun"></i> Temp <strong>{{ reading.temperature }}°C</strong>
      </li>
      <li class="telemetry-card__metric">
        <i class="pi pi-bolt"></i> Light <strong>{{ reading.lightLevel }} lx</strong>
      </li>
      <li class="telemetry-card__metric">
        <i class="pi pi-database"></i> Soil <strong>{{ reading.soilMoisture }}%</strong>
      </li>
    </ul>

    <footer class="telemetry-card__footer">
      <span class="telemetry-card__device">{{ reading.deviceId }}</span>
      <time class="telemetry-card__time">{{ recordedAtLabel }}</time>
    </footer>
  </article>
</template>

<style scoped>
.telemetry-card {
  background-color: var(--oryxen-card);
  border: 1px solid var(--oryxen-border);
  border-left-width: 6px;
  border-radius: 0.8rem;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.telemetry-card--critical { border-left-color: var(--oryxen-critical); }
.telemetry-card--warning { border-left-color: var(--oryxen-warning); }
.telemetry-card--good { border-left-color: var(--oryxen-good); }
.telemetry-card--optimal { border-left-color: var(--oryxen-optimal); }

.telemetry-card__header {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.telemetry-card__score {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}

.telemetry-card__status {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}

.telemetry-card--critical .telemetry-card__status { color: var(--oryxen-critical); }
.telemetry-card--warning .telemetry-card__status { color: var(--oryxen-warning); }
.telemetry-card--good .telemetry-card__status { color: var(--oryxen-good); }
.telemetry-card--optimal .telemetry-card__status { color: var(--oryxen-optimal); }

.telemetry-card__metrics {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem 1rem;
}

.telemetry-card__metric {
  font-size: 0.85rem;
  color: var(--oryxen-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.telemetry-card__metric strong {
  color: var(--oryxen-foreground);
  margin-left: auto;
}

.telemetry-card__footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--oryxen-muted);
  border-top: 1px solid var(--oryxen-border);
  padding-top: 0.5rem;
}
</style>
