/**
 * Domain entity for a plant AI diagnosis produced by the Gemini Vision multimodal analysis.
 * Mirrors the backend `DiagnosisResponse` record (Oryxen.Application.AI.Contracts).
 */
export interface Diagnosis {
  id: string;
  plantId: string;
  imageUrl: string;
  detectedPest: string;
  confidenceScore: number;
  recommendation: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
  analyzedAt: string | null;
}
