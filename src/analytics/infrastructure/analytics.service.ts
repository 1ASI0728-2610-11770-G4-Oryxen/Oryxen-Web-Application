import { apiClient } from '@/services/httpClient';
import type {
  DashboardResponse,
  PlantTrendResponse,
  ReportListResponse,
  ReportDetailResponse,
  GenerateReportRequest,
} from '../domain/model/analytics.entity';

export class AnalyticsService {
  async getDashboard(): Promise<DashboardResponse> {
    const { data } = await apiClient.get<DashboardResponse>('/analytics/dashboard');
    return data;
  }

  async getPlantTrends(plantId: string): Promise<PlantTrendResponse> {
    const { data } = await apiClient.get<PlantTrendResponse>(
      `/analytics/plants/${encodeURIComponent(plantId)}/trends`,
    );
    return data;
  }

  async getReports(plantId?: string, page = 1, size = 20): Promise<ReportListResponse> {
    const params: Record<string, string | number> = { page, size };
    if (plantId) {
      params.plantId = plantId;
    }
    const { data } = await apiClient.get<ReportListResponse>('/analytics/reports', { params });
    return data;
  }

  async getReportById(reportId: string): Promise<ReportDetailResponse> {
    const { data } = await apiClient.get<ReportDetailResponse>(
      `/analytics/reports/${encodeURIComponent(reportId)}`,
    );
    return data;
  }

  async generateReport(request: GenerateReportRequest): Promise<ReportDetailResponse> {
    const { data } = await apiClient.post<ReportDetailResponse>('/analytics/reports', request);
    return data;
  }
}

export const analyticsService = new AnalyticsService();
