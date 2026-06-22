import { defineStore } from 'pinia';
import { ref } from 'vue';
import { diagnosisService } from '@/ai/infrastructure/diagnosis.service';
import type { Diagnosis } from '@/ai/domain/model/diagnosis.entity';

/**
 * Pinia store for the AI diagnosis module. Manages the upload lifecycle
 * (idle → uploading → analyzing → result/error) and the history list.
 */
export const useDiagnosisStore = defineStore('diagnosis', () => {
  const current = ref<Diagnosis | null>(null);
  const history = ref<Diagnosis[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function createDiagnosis(plantId: string, image: File) {
    loading.value = true;
    error.value = null;
    current.value = null;
    try {
      current.value = await diagnosisService.create(plantId, image);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze image';
    } finally {
      loading.value = false;
    }
  }

  async function loadHistory(plantId: string) {
    loading.value = true;
    error.value = null;
    try {
      history.value = await diagnosisService.getByPlant(plantId);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load history';
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    current.value = null;
    error.value = null;
    loading.value = false;
  }

  return { current, history, loading, error, createDiagnosis, loadHistory, reset };
});
