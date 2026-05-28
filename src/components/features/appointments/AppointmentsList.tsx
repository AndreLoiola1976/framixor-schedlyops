import { useMemo, useState } from "react";
import { AppointmentFilters, type AppointmentFilterValue } from "./AppointmentFilters";
import { AppointmentRow } from "./AppointmentRow";
import { useAppointments } from "@/hooks/useAppointments";
import { useClientMap } from "@/hooks/useClients";
import { useServiceMap } from "@/hooks/useServices";
import { useProfessionalMap } from "@/hooks/useProfessionals";
import { Card } from "@/components/ui/card";
import { formatLongDate, dayKey } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { useT } from "@/i18n/useT";

export function AppointmentsList() {
  const t = useT();
  const all = useAppointments();
  const clientMap = useClientMap();
  const serviceMap = useServiceMap();
  const proMap = useProfessionalMap();

  const [filters, setFilters] = useState<AppointmentFilterValue>({
    status: "all",
    professionalId: "all",
  });

  const filtered = useMemo(() => {
    return all.filter((a) => {
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.professionalId !== "all" && a.professionalId !== filters.professionalId)
        return false;
      return true;
    });
  }, [all, filters]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const a of filtered) {
      const k = dayKey(a.startISO);
      const arr = map.get(k) ?? [];
      arr.push(a);
      map.set(k, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AppointmentFilters value={filters} onChange={setFilters} />
        <p className="text-xs text-muted-foreground tabular-nums">
          {filtered.length === 1
            ? t.appointments.countOne.replace("{count}", "1")
            : t.appointments.countOther.replace("{count}", String(filtered.length))}
        </p>
      </div>

      {grouped.length === 0 ? (
        <EmptyState title={t.common.empty} />
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([day, items]) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {formatLongDate(day + "T00:00:00")}
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  · {items.length}
                </span>
              </div>
              <Card className="overflow-hidden p-0">
                <div className="grid grid-cols-12 gap-3 border-b border-border bg-muted/40 px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2">{t.common.when}</div>
                  <div className="col-span-3">{t.common.client}</div>
                  <div className="col-span-3">{t.common.service}</div>
                  <div className="col-span-2">{t.common.professional}</div>
                  <div className="col-span-1">{t.common.price}</div>
                  <div className="col-span-1 text-right">{t.common.status}</div>
                </div>
                <div className="divide-y divide-border">
                  {items.map((a) => (
                    <AppointmentRow
                      key={a.id}
                      appointment={a}
                      client={clientMap[a.clientId]}
                      service={serviceMap[a.serviceId]}
                      professional={proMap[a.professionalId]}
                    />
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
