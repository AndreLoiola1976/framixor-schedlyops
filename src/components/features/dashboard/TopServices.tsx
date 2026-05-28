import { SectionCard } from "@/components/common/SectionCard";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useServiceMap } from "@/hooks/useServices";
import { useT } from "@/i18n/useT";
import { formatCurrency, formatNumber } from "@/lib/format";

export function TopServices() {
  const t = useT();
  const { topServices } = useDashboardMetrics();
  const serviceMap = useServiceMap();
  const max = Math.max(...topServices.map((s) => s.bookings));

  return (
    <SectionCard title={t.dashboard.topServicesTitle} description={t.dashboard.topServicesSubtitle}>
      <ul className="flex flex-col gap-3">
        {topServices.map((entry) => {
          const svc = serviceMap[entry.serviceId];
          const pct = (entry.bookings / max) * 100;
          return (
            <li key={entry.serviceId} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{svc?.name ?? entry.serviceId}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatNumber(entry.bookings)} · {formatCurrency(entry.revenueCents)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
