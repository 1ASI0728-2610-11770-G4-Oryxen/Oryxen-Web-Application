import { apiClient } from '@/services/httpClient';
import { DiagnosisAssembler } from '@/ai/infrastructure/assembler/diagnosis-assembler';
import type { Diagnosis } from '@/ai/domain/model/diagnosis.entity';

/**
 * Infrastructure service that calls the Oryxen .NET backend AI endpoints.
 * Uses the authenticated `apiClient` (Bearer JWT interceptor is already wired).
 */
export class DiagnosisService {
  /**
   * Uploads a crop photograph (multipart/form-data) for multimodal AI analysis.
   * @param plantId Target plant GUID
   * @param image File object from input/drag-drop
   */
  async create(plantId: string, image: File): Promise<Diagnosis> {
    const formData = new FormData();
    formData.append('plantId', plantId);
    formData.append('image', image);

    const { data } = await apiClient.post('/ai/diagnoses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return DiagnosisAssembler.toDomain(data);
  }

  async getById(id: string): Promise<Diagnosis> {
    const { data } = await apiClient.get(`/ai/diagnoses/${id}`);
    return DiagnosisAssembler.toDomain(data);
  }

  async getByPlant(plantId: string): Promise<Diagnosis[]> {
    const { data } = await apiClient.get(`/ai/plants/${plantId}/diagnoses`);
    return DiagnosisAssembler.toDomainList(data);
  }
}

export const diagnosisService = new DiagnosisService();
