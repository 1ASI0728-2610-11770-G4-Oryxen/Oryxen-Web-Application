export interface PlantHealthSummary {
  plantId: string;
  plantName: string;
  plantType: string;
  status: string;
  avgHealthScore: number;
  avgSoilMoisture: number;
  readingCount: number;
  lastReadingAt: string | null;
}

export interface DashboardResponse {
  totalPlants: number;
  healthyPlants: number;
  warningPlants: number;
  criticalPlants: number;
  avgHumidity: number;
  avgTemperature: number;
  avgSoilMoisture: number;
  avgLightLevel: number;
  avgHealthScore: number;
  totalReadings: number;
  plantSummaries: PlantHealthSummary[];
}

export interface TrendPoint {
  label: string;
  avgHealthScore: number;
  avgSoilMoisture: number;
  avgTemperature: number;
  avgHumidity: number;
  readingCount: number;
}

export interface PlantTrendResponse {
  plantId: string;
  plantName: string;
  daily: TrendPoint[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}

export interface ReportItemResponse {
  id: string;
  plantId: string;
  plantName: string;
  type: string;
  status: string;
  format: string;
  rangeStart: string;
  rangeEnd: string;
  createdAt: string;
  generatedAt: string | null;
}

export interface ReportListResponse {
  items: ReportItemResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ReportDetailResponse {
  id: string;
  plantId: string;
  plantName: string;
  type: string;
  status: string;
  format: string;
  rangeStart: string;
  rangeEnd: string;
  fileContent: string | null;
  createdAt: string;
  generatedAt: string | null;
}

export interface GenerateReportRequest {
  plantId: string;
  rangeStart: string;
  rangeEnd: string;
  type: string;
  format: string;
}
