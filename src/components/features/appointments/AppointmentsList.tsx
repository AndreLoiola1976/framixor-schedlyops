import { useMemo, useState } from "react";
import { AppointmentFilters, type AppointmentFilterValue } from "./AppointmentFilters";
import { AppointmentRow } from "./AppointmentRow";
import { AppointmentCard } from "./AppointmentCard";
import { AppointmentsEmpty } from "./AppointmentsEmpty";
import { useAppointments } from "@/hooks/useAppointments";
import { useClientMap } from "@/hooks/useClients";
import { useServiceMap } from "@/hooks/useServices";
import { useProfessionalMap } from "@/hooks/useProfessionals";
import { useTenant } from "@/hooks/useTenant";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLongDate } from "@/lib/format";
import { useT } from "@/i18n/useT";
import { useTodayKey } from "@/lib/today-key";
import { dayKeyInTz } from "@/lib/today-key";
import { filterAppointments } from "@/lib/appointments-filter";
import type { Appointment } from "@/types/appointment";

export function AppointmentsList() {
  const t = useT();
  const all = useAppointments();
  const tenant = useTenant();
  const clientMap = useClientMap();
  const serviceMap = useServiceMap();
  const proMap = useProfessionalMap();
  const todayKey = useTodayKey(tenant.timezone);

  const [filters, setFilters] = useState<AppointmentFilterValue>({
    quick: "today",
    professionalId: "all",
    search: "",
  });

  const filtered = useMemo(
    () =>
      filterAppointments(all, {
        quick: filters.quick,
        professionalId: filters.professionalId,
        search: filters.search,
        todayKey,
        nowISO: new Date().toISOString(),
        timezone: tenant.timezone,
        serviceMap,
        professionalMap: proMap,
      }),
    [all, filters, todayKey, tenant.timezone, serviceMap, proMap],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of filtered) {
      const k = dayKeyInTz(a.startISO, tenant.timezone);
      const arr = map.get(k) ?? [];
      arr.push(a);
      map.set(k, arr);
    }
    return Array.from(map.entries())
      .map(
        ([day, items]) =>
          [day, items.slice().sort((x, y) => x.startISO.localeCompare(y.startISO))] as const,
      )
      .sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, tenant.timezone]);

  const quickLabel = t.appointments.quickFilters[filters.quick];
  const countLabel =
    filtered.length === 1
      ? t.appointments.countOne.replace("{count}", "1")
      : t.appointments.countOther.replace("{count}", String(filtered.length));

  return (
    <div className="flex flex-col gap-4">
      <AppointmentFilters value={filters} onChange={setFilters} />

      {/* Active-filter summary bar — keeps it obvious that "0" is filtered, not missing data. */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-[11px]">
          {quickLabel}
        </Badge>
        {filters.search ? (
          <Badge variant="outline" className="text-[11px]">
            “{filters.search}”
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground tabular-nums">· {countLabel}</span>
      </div>

      {grouped.length === 0 ? (
        <AppointmentsEmpty quick={filters.quick} hasSearch={!!filters.search.trim()} />
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([day, items]) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {formatLongDate(day + "T00:00:00")}
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">· {items.length}</span>
              </div>
              <Card className="overflow-hidden p-0">
                {/* Desktop column header */}
                <div className="hidden grid-cols-12 gap-3 border-b border-border bg-muted/40 px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
                  <div className="col-span-2">{t.common.when}</div>
                  <div className="col-span-3">{t.common.client}</div>
                  <div className="col-span-3">{t.common.service}</div>
                  <div className="col-span-2">{t.common.professional}</div>
                  <div className="col-span-1">{t.common.price}</div>
                  <div className="col-span-1 text-right">{t.common.status}</div>
                </div>
                <div className="divide-y divide-border">
                  {items.map((a) => (
                    <div key={a.id}>
                      {/* Desktop row */}
                      <div className="hidden md:block">
                        <AppointmentRow
                          appointment={a}
                          client={clientMap[a.clientId]}
                          service={serviceMap[a.serviceId]}
                          professional={proMap[a.professionalId]}
                        />
                      </div>
                      {/* Mobile card */}
                      <div className="md:hidden">
                        <AppointmentCard
                          appointment={a}
                          client={clientMap[a.clientId]}
                          service={serviceMap[a.serviceId]}
                          professional={proMap[a.professionalId]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
