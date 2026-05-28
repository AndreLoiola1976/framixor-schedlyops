import { dashboardMetrics, revenueSeries, topServices } from "@/config/metrics";

export function useDashboardMetrics() {
  return { metrics: dashboardMetrics, revenueSeries, topServices };
}
