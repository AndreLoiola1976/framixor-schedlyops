import { CalendarClock } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useT } from "@/i18n/useT";
import { formatTime } from "@/lib/format";
import type { Appointment } from "@/types/appointment";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";

interface Props {
  appointment: Appointment | null;
  service?: Service;
  professional?: Professional;
}

function displayInitials(a: Appointment): string {
  const name = a.customerName?.trim();
  if (!name) return "—";
  return name.slice(0, 2).toUpperCase();
}

export function NextAppointmentCard({ appointment, service, professional }: Props) {
  const t = useT();
  const next = t.dashboard.today.next;

  return (
    <SectionCard title={next.title} description={next.subtitle}>
      {!appointment ? (
        <EmptyState title={next.empty} icon={CalendarClock} />
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {displayInitials(appointment)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {appointment.customerName ?? "—"}
              </p>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatTime(appointment.startISO)}
              </span>
            </div>
            {appointment.customerPhone ? (
              <p className="truncate text-xs text-muted-foreground">{appointment.customerPhone}</p>
            ) : null}
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {service?.name ?? "—"} · {professional?.name ?? "—"}
            </p>
            <div className="mt-2">
              <StatusBadge status={appointment.status} />
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
