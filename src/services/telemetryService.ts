import type { TelemetryIngestPayload, TelemetryReading } from '@/types/telemetry';
import { apiClient, rawClient } from './httpClient';

/** Wrapper over the backend telemetry endpoints (`/api/v1/telemetry`). */
export const telemetryService = {
  /** Ingest a Sensor Lite reading (anonymous endpoint during Sprint 1). */
  ingest(payload: TelemetryIngestPayload): Promise<TelemetryReading> {
    return rawClient.post<TelemetryReading>('/telemetry', payload).then((r) => r.data);
  },

  /** Recent telemetry history for a plant (requires FARMER or ADMIN). */
  getByPlant(
    plantId: string,
    range?: { from?: string; to?: string },
  ): Promise<TelemetryReading[]> {
    return apiClient
      .get<TelemetryReading[]>(`/telemetry/${plantId}`, { params: range })
      .then((r) => r.data);
  },
};
