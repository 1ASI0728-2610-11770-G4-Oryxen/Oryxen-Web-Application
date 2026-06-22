<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Select from 'primevue/select';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import Card from 'primevue/card';
import Message from 'primevue/message';

import { useDiagnosisStore } from '@/ai/application/diagnosis.store';
import { PlantsService } from '@/plants/infrastructure/plants.services';
import { tokenStorage } from '@/services/tokenStorage';
import type { Diagnosis } from '@/ai/domain/model/diagnosis.entity';

const { t } = useI18n();
const toast = useToast();
const store = useDiagnosisStore();

interface PlantOption {
  id: string;
  name: string;
}

const plants = ref<PlantOption[]>([]);
const selectedPlantId = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const dragOver = ref(false);

onMounted(async () => {
  const userId = tokenStorage.getUserId();
  if (!userId) return;
  try {
    const svc = new PlantsService();
    const userPlants = await svc.getPlantsByUser(userId);
    plants.value = userPlants.map((p) => ({ id: p.id, name: p.name }));
    if (plants.value.length > 0) {
      selectedPlantId.value = plants.value[0].id;
    }
  } catch {
    // Silent fail — user may have no plants yet
  }
});

watch(selectedPlantId, async (plantId) => {
  if (plantId) {
    await store.loadHistory(plantId);
  }
});

function onFileSelect(event: { files: File[] }) {
  const file = event.files?.[0];
  if (file) setFile(file);
}

function onDrop(event: DragEvent) {
  dragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    setFile(file);
  }
}

function setFile(file: File) {
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

function clearFile() {
  selectedFile.value = null;
  previewUrl.value = null;
}

async function submitDiagnosis() {
  if (!selectedPlantId.value || !selectedFile.value) return;
  await store.createDiagnosis(selectedPlantId.value, selectedFile.value);
  if (store.current && store.current.status === 'Completed') {
    toast.add({ severity: 'success', summary: t('ai.analysisComplete'), detail: store.current.detectedPest, life: 5000 });
    await store.loadHistory(selectedPlantId.value);
  } else if (store.error) {
    toast.add({ severity: 'error', summary: t('ai.analysisFailed'), detail: store.error, life: 5000 });
  }
}

function confidenceSeverity(d: Diagnosis): 'success' | 'warn' | 'danger' {
  if (d.detectedPest === 'None') return 'success';
  if (d.confidenceScore >= 0.7) return 'danger';
  return 'warn';
}

function confidencePct(d: Diagnosis): string {
  return `${(d.confidenceScore * 100).toFixed(1)}%`;
}
</script>

<template>
  <div class="ai-diagnosis" role="main" aria-labelledby="ai-title">
    <h1 id="ai-title" class="ai-diagnosis__title">{{ t('ai.title') }}</h1>
    <p class="ai-diagnosis__subtitle">{{ t('ai.subtitle') }}</p>

    <!-- Plant selector -->
    <div class="ai-diagnosis__plant-select">
      <label for="plant-select" class="ai-diagnosis__label">{{ t('ai.selectPlant') }}</label>
      <Select
        id="plant-select"
        v-model="selectedPlantId"
        :options="plants"
        option-label="name"
        option-value="id"
        :placeholder="t('ai.selectPlant')"
        aria-required="true"
        class="w-full"
      />
    </div>

    <!-- Upload zone -->
    <div
      class="ai-diagnosis__dropzone"
      :class="{ 'drag-over': dragOver }"
      role="button"
      :aria-label="t('ai.dragDrop')"
      tabindex="0"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      @keyup.enter="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="ai-diagnosis__file-input"
        aria-label="Image upload"
        @change="onFileSelect({ files: Array.from(($event.target as HTMLInputElement).files ?? []) })"
      />

      <template v-if="!previewUrl">
        <div class="ai-diagnosis__drop-hint">
          <span class="ai-diagnosis__drop-icon" aria-hidden="true">📷</span>
          <p>{{ t('ai.dragDrop') }}</p>
          <p class="ai-diagnosis__upload-hint">{{ t('ai.uploadHint') }}</p>
        </div>
      </template>

      <template v-else>
        <div class="ai-diagnosis__preview">
          <img :src="previewUrl" :alt="t('ai.previewAlt')" class="ai-diagnosis__preview-img" />
          <Button
            :label="t('ai.changeImage')"
            icon="pi pi-refresh"
            size="small"
            text
            :aria-label="t('ai.changeImage')"
            @click="clearFile"
          />
        </div>
      </template>
    </div>

    <!-- Submit button -->
    <Button
      v-if="selectedFile && selectedPlantId"
      :label="t('ai.analyze')"
      icon="pi pi-search"
      :loading="store.loading"
      :disabled="store.loading"
      :aria-label="t('ai.analyze')"
      class="ai-diagnosis__submit"
      @click="submitDiagnosis"
    />

    <!-- Loading state -->
    <div v-if="store.loading" class="ai-diagnosis__loading" role="status" aria-live="polite">
      <ProgressSpinner />
      <p>{{ t('ai.analyzing') }}</p>
    </div>

    <!-- Error state -->
    <Message v-if="store.error && !store.loading" severity="error" :closable="false">
      {{ t('ai.analysisFailed') }}: {{ store.error }}
    </Message>

    <!-- Result card -->
    <Card v-if="store.current && store.current.status === 'Completed' && !store.loading" class="ai-diagnosis__result">
      <template #title>
        <span id="ai-result-title">{{ t('ai.resultTitle') }}</span>
      </template>
      <template #content>
        <div class="ai-diagnosis__result-grid">
          <div class="ai-diagnosis__result-row">
            <span class="ai-diagnosis__result-label">{{ t('ai.detectedPest') }}:</span>
            <Tag
              :severity="confidenceSeverity(store.current)"
              :value="store.current.detectedPest === 'None' ? t('ai.noPestDetected') : store.current.detectedPest"
            />
          </div>
          <div class="ai-diagnosis__result-row">
            <span class="ai-diagnosis__result-label">{{ t('ai.confidence') }}:</span>
            <span class="ai-diagnosis__result-value">{{ confidencePct(store.current) }}</span>
          </div>
          <div class="ai-diagnosis__result-row ai-diagnosis__recommendation">
            <span class="ai-diagnosis__result-label">{{ t('ai.recommendation') }}:</span>
            <p class="ai-diagnosis__recommendation-text">{{ store.current.recommendation }}</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- History -->
    <div v-if="store.history.length > 0" class="ai-diagnosis__history" role="region" :aria-label="t('ai.history')">
      <h2 class="ai-diagnosis__history-title">{{ t('ai.history') }}</h2>
      <div v-for="d in store.history" :key="d.id" class="ai-diagnosis__history-item">
        <div class="ai-diagnosis__history-header">
          <Tag
            :severity="confidenceSeverity(d)"
            :value="d.detectedPest === 'None' ? t('ai.noPestDetected') : d.detectedPest"
          />
          <span class="ai-diagnosis__history-date">{{ new Date(d.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="ai-diagnosis__history-rec">{{ d.recommendation }}</p>
      </div>
    </div>

    <!-- Empty state when no plants -->
    <Message v-if="plants.length === 0" severity="info" :closable="false">
      {{ t('ai.noPlants') }}
    </Message>
  </div>
</template>

<style scoped>
.ai-diagnosis {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.ai-diagnosis__title {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
}

.ai-diagnosis__subtitle {
  color: var(--text-secondary, #6b7280);
  margin: 0 0 2rem;
}

.ai-diagnosis__plant-select {
  margin-bottom: 1.5rem;
}

.ai-diagnosis__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.ai-diagnosis__dropzone {
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-diagnosis__dropzone.drag-over {
  border-color: var(--primary-green, #22c55e);
  background: rgba(34, 197, 94, 0.05);
}

.ai-diagnosis__file-input {
  display: none;
}

.ai-diagnosis__drop-hint {
  color: var(--text-secondary, #6b7280);
}

.ai-diagnosis__drop-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.ai-diagnosis__upload-hint {
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.ai-diagnosis__preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.ai-diagnosis__preview-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
  object-fit: contain;
}

.ai-diagnosis__submit {
  margin-top: 1.5rem;
  width: 100%;
}

.ai-diagnosis__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.ai-diagnosis__result {
  margin-top: 2rem;
}

.ai-diagnosis__result-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ai-diagnosis__result-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ai-diagnosis__result-label {
  font-weight: 600;
  min-width: 140px;
}

.ai-diagnosis__recommendation {
  align-items: flex-start;
}

.ai-diagnosis__recommendation-text {
  margin: 0;
  line-height: 1.6;
}

.ai-diagnosis__history {
  margin-top: 2.5rem;
}

.ai-diagnosis__history-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.ai-diagnosis__history-item {
  padding: 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}

.ai-diagnosis__history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ai-diagnosis__history-date {
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
}

.ai-diagnosis__history-rec {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary, #374151);
}
</style>
