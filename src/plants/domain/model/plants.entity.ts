
export interface Metric {
  id: string | null;
  plantId: string;
  deviceId: string;
  airTemperatureC: number;
  airHumidityPct: number;
  lightIntensityLux: number;
  soilMoisturePct: number;
  timestamp: string;
}

export interface WateringLog {
  id: string;
  plantId: string;
  wateredAt: string;
}

export interface Plant {
  id: string;
  userId: string;
  name: string;
  type: string;
  imgUrl: string;
  bio: string;
  location: string;
  status: PlantStatus;
  lastWatered: string;
  nextWatering: string;
  metrics: Metric[];
  wateringLogs: WateringLog[];
  createdAt: string;
  updatedAt: string;
}


export type PlantStatus = 'healthy' | 'warning' | 'critical';
