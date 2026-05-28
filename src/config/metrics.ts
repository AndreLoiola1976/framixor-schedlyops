import type { MetricDefinition, RevenuePoint, TopServiceEntry } from "@/types/metric";

export const dashboardMetrics: MetricDefinition[] = [
  {
    id: "revenue",
    labelKey: "dashboard.metrics.revenue",
    format: "currency",
    value: 1284500,
    deltaPercent: 12.4,
  },
  {
    id: "bookings",
    labelKey: "dashboard.metrics.bookings",
    format: "number",
    value: 187,
    deltaPercent: 8.1,
  },
  {
    id: "occupancy",
    labelKey: "dashboard.metrics.occupancy",
    format: "percent",
    value: 0.78,
    deltaPercent: 3.2,
  },
  {
    id: "newClients",
    labelKey: "dashboard.metrics.newClients",
    format: "number",
    value: 24,
    deltaPercent: -2.6,
  },
];

export const revenueSeries: RevenuePoint[] = [
  { label: "Thu", revenue: 142000, bookings: 21 },
  { label: "Fri", revenue: 198500, bookings: 28 },
  { label: "Sat", revenue: 264000, bookings: 34 },
  { label: "Sun", revenue: 86000, bookings: 12 },
  { label: "Mon", revenue: 174500, bookings: 24 },
  { label: "Tue", revenue: 211000, bookings: 31 },
  { label: "Wed", revenue: 208500, bookings: 29 },
];

export const topServices: TopServiceEntry[] = [
  { serviceId: "svc_haircut", bookings: 48, revenueCents: 408000 },
  { serviceId: "svc_color", bookings: 31, revenueCents: 573500 },
  { serviceId: "svc_facial", bookings: 27, revenueCents: 364500 },
  { serviceId: "svc_gel", bookings: 24, revenueCents: 156000 },
  { serviceId: "svc_massage", bookings: 19, revenueCents: 228000 },
];
