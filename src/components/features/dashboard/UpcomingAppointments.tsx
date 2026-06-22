import { useEffect, useState } from "react";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useAppointments } from "@/hooks/useAppointments";
import { useClientMap } from "@/hooks/useClients";
import { useServiceMap } from "@/hooks/useServices";
import { useProfessionalMap } from "@/hooks/useProfessionals";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";
import { dayKey, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

/**
 * Compute today's YYYY-MM-DD in the tenant's timezone when available, falling
 * back to the browser's local zone. Runs on the client only to avoid SSR vs.
 * client hydration mismatches when the server clock or zone differs.
 */
function computeTodayKey(timezone?: string): string {
  const now = new Date();
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;
      if (y && m && d) return `${y}-${m}-${d}`;
    } catch {
      /* fall through to local */
    }
  }
  return dayKey(now.toISOString());
}

export function UpcomingAppointments() {
  const t = useT();
  const tenant = useTenant();
  const [todayKey, setTodayKey] = useState<string | null>(null);
  useEffect(() => {
    setTodayKey(computeTodayKey(tenant.timezone));
  }, [tenant.timezone]);

  const all = useAppointments();
  const appts = todayKey ? all.filter((a) => dayKey(a.startISO) === todayKey) : [];
  const clientMap = useClientMap();
  const serviceMap = useServiceMap();
  const proMap = useProfessionalMap();

  return (
    <SectionCard
      title={t.dashboard.upcomingTitle}
      description={t.dashboard.upcomingSubtitle}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/appointments">{t.common.viewAll}</Link>
        </Button>
      }
      contentClassName="p-0"
    >
      {appts.length === 0 ? (
        <div className="p-6">
          <EmptyState title={t.common.empty} icon={CalendarCheck} />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {appts.map((a) => {
            const client = clientMap[a.clientId];
            const service = serviceMap[a.serviceId];
            const pro = proMap[a.professionalId];
            return (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {client?.initials ?? "—"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {client?.name ?? "Unknown"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {service?.name} · {pro?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-medium tabular-nums">{formatTime(a.startISO)}</span>
                  <StatusBadge status={a.status} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
