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
import { useTodayKey } from "@/lib/today-key";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";

export function UpcomingAppointments() {
  const t = useT();
  const tenant = useTenant();
  const todayKey = useTodayKey(tenant.timezone);

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
