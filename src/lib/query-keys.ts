/**
 * Centralized React Query keys for cache invalidation.
 */
export const qk = {
  tenant: ["tenant"] as const,
  services: ["services"] as const,
  professionals: ["professionals"] as const,
  workingHours: (professionalId?: string) =>
    professionalId ? (["working_hours", professionalId] as const) : (["working_hours"] as const),
  bookings: ["bookings"] as const,
  clients: ["clients"] as const,
  dashboardMetrics: ["dashboard_metrics"] as const,
};
