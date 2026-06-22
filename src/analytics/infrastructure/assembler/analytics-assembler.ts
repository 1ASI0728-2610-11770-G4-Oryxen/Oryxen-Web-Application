import type { PlantTrendResponse } from '../domain/model/analytics.entity';

export class AnalyticsAssembler {
  static extractDailyHealthChart(trends: PlantTrendResponse): { label: string; value: number }[] {
    return trends.daily.map((p) => ({ label: p.label, value: p.avgHealthScore }));
  }

  static extractDailySoilChart(trends: PlantTrendResponse): { label: string; value: number }[] {
    return trends.daily.map((p) => ({ label: p.label, value: p.avgSoilMoisture }));
  }
}
