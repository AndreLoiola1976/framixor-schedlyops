import { useMemo } from "react";
import { dashboardMetrics, revenueSeries, topServices } from "@/config/metrics";
import { IS_SUPABASE } from "@/lib/env";
import { useAppointments } from "./useAppointments";
import { useServices } from "./useServices";
import type { MetricDefinition } from "@/types/metric";

/**
 * In mock mode, returns the static fixture. In supabase mode, derives a few
 * non-financial preview metrics client-side from operator_list_bookings.
 */
export function useDashboardMetrics() {
  const appts = useAppointments();
  const services = useServices();

  return useMemo(() => {
    if (!IS_SUPABASE) {
      return { metrics: dashboardMetrics, revenueSeries, topServices, derived: false };
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    const thisMonth = appts.filter((a) => a.startISO >= monthStart && a.startISO < monthEnd);
    const upcoming = appts.filter((a) => a.startISO >= now.toISOString());
    const distinctPros = new Set(thisMonth.map((a) => a.professionalId)).size;

    const metrics: MetricDefinition[] = [
      {
        id: "bookingsThisMonth",
        labelKey: "dashboard.metrics.bookingsThisMonth",
        format: "number",
        value: thisMonth.length,
        deltaPercent: 0,
      },
      {
        id: "upcoming",
        labelKey: "dashboard.metrics.upcoming",
        format: "number",
        value: upcoming.length,
        deltaPercent: 0,
      },
      {
        id: "activeProfessionals",
        labelKey: "dashboard.metrics.activeProfessionals",
        format: "number",
        value: distinctPros,
        deltaPercent: 0,
      },
      {
        id: "activeServices",
        labelKey: "dashboard.metrics.activeServices",
        format: "number",
        value: services.filter((s) => s.active).length,
        deltaPercent: 0,
      },
    ];

    // Top services by booking count (no revenue)
    const counts = new Map<string, number>();
    for (const a of thisMonth) {
      counts.set(a.serviceId, (counts.get(a.serviceId) ?? 0) + 1);
    }
    const top = Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([serviceId, bookings]) => ({ serviceId, bookings, revenueCents: 0 }));

    return { metrics, revenueSeries: [], topServices: top, derived: true };
  }, [appts, services]);
}
