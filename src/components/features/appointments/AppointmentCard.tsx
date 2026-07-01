import { StatusBadge } from "@/components/common/StatusBadge";
import type { Appointment } from "@/types/appointment";
import type { Client } from "@/types/client";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import { formatCurrency, formatTime } from "@/lib/format";
import { useT } from "@/i18n/useT";
import { AppointmentRowActions } from "./AppointmentRowActions";

interface Props {
  appointment: Appointment;
  client?: Client;
  service?: Service;
  professional?: Professional;
}

/**
 * Mobile-friendly stacked card. Replaces the 12-col grid below `md`.
 * Layout is contained inside the parent so nothing overflows horizontally.
 */
export function AppointmentCard({ appointment, client, service, professional }: Props) {
  const t = useT();
  const isBlock = appointment.type === "block";
  const displayName = isBlock
    ? t.appointments.row.blocked
    : (client?.name ?? appointment.customerName ?? "—");
  const displayPhone = isBlock ? "" : (client?.phone ?? appointment.customerPhone ?? "");
  const displayInitials = isBlock
    ? "—"
    : (client?.initials ?? appointment.customerName?.trim().slice(0, 2).toUpperCase() ?? "—");

  return (
    <div className={"flex flex-col gap-2 px-4 py-3" + (isBlock ? " bg-muted/30" : "")}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatTime(appointment.startISO)}
        </span>
        {isBlock ? (
          <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t.appointments.row.blocked}
          </span>
        ) : (
          <StatusBadge status={appointment.status} />
        )}
      </div>

      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {displayInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          {displayPhone ? (
            <p className="truncate text-xs text-muted-foreground">{displayPhone}</p>
          ) : null}
        </div>
        {!isBlock ? <AppointmentRowActions appointment={appointment} /> : null}
      </div>

      {!isBlock ? (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {service?.name ?? "—"} · {professional?.name ?? "—"}
          </span>
          <span className="tabular-nums text-foreground">
            {formatCurrency(appointment.priceCents)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
