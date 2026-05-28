export type MetricFormat = "currency" | "number" | "percent";

export interface MetricDefinition {
  id: string;
  labelKey: string;
  format: MetricFormat;
  value: number;
  deltaPercent: number;
  helpKey?: string;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface TopServiceEntry {
  serviceId: string;
  bookings: number;
  revenueCents: number;
}
