import { CalendarCheck } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useT } from "@/i18n/useT";
import { formatTime } from "@/lib/format";
import type { Appointment } from "@/types/appointment";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import { LifecycleQuickActions } from "./LifecycleQuickActions";

interface Props {
  appointments: Appointment[];
  serviceMap: Record<string, Service>;
  professionalMap: Record<string, Professional>;
}

function initialsOf(a: Appointment): string {
  const name = a.customerName?.trim();
  if (!name) return "—";
  return name.slice(0, 2).toUpperCase();
}

export function TodayScheduleList({ appointments, serviceMap, professionalMap }: Props) {
  const t = useT();
  const s = t.dashboard.today.schedule;

  return (
    <SectionCard title={s.title} description={s.subtitle} contentClassName="p-0">
      {appointments.length === 0 ? (
        <div className="p-6">
          <EmptyState title={s.empty} icon={CalendarCheck} />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {appointments.map((a) => {
            const isBlock = a.type === "block";
            const service = serviceMap[a.serviceId];
            const pro = professionalMap[a.professionalId];
            return (
              <li
                key={a.id}
                className={
                  "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5" +
                  (isBlock ? " bg-muted/40" : "")
                }
              >
                <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatTime(a.startISO)}
                  </span>
                  {isBlock ? (
                    <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {s.blocked}
                    </span>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {initialsOf(a)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {isBlock ? (
                    <p className="text-sm text-muted-foreground">{s.blocked}</p>
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.customerName ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.customerPhone ? `${a.customerPhone} · ` : ""}
                        {service?.name ?? "—"} · {pro?.name ?? "—"}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  {!isBlock ? <StatusBadge status={a.status} /> : null}
                  <LifecycleQuickActions appointment={a} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
