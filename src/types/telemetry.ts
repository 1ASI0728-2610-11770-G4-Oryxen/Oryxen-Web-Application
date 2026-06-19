export interface TelemetryReading {
  id: string;
  deviceId: string;
  plantId: string;
  humidity: number;
  temperature: number;
  lightLevel: number;
  soilMoisture: number;
  healthScore: number;
  recordedAt: string;
}

export interface TelemetryIngestPayload {
  deviceId: string;
  plantId: string;
  humidity: number;
  temperature: number;
  lightLevel: number;
  soilMoisture: number;
  recordedAt?: string;
}

export type HealthStatus = 'critical' | 'warning' | 'good' | 'optimal';

/** Maps the backend Health Score (0-100) to a qualitative status, mirroring the
 * thresholds used by the Domain `PlantHealthCalculator`. */
export function toHealthStatus(score: number): HealthStatus {
  if (score < 30) return 'critical';
  if (score < 60) return 'warning';
  if (score < 80) return 'good';
  return 'optimal';
}
