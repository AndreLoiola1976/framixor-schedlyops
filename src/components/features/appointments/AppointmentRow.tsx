import { StatusBadge } from "@/components/common/StatusBadge";
import type { Appointment } from "@/types/appointment";
import type { Client } from "@/types/client";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import { formatCurrency, formatDuration, formatTime } from "@/lib/format";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentRowProps {
  appointment: Appointment;
  client?: Client;
  service?: Service;
  professional?: Professional;
}

export function AppointmentRow({
  appointment,
  client,
  service,
  professional,
}: AppointmentRowProps) {
  const isBlock = appointment.type === "block";
  const displayName = isBlock ? "Blocked" : (client?.name ?? appointment.customerName ?? "—");
  const displayPhone = isBlock ? "" : (client?.phone ?? appointment.customerPhone ?? "");
  const displayInitials = isBlock
    ? "—"
    : (client?.initials ??
      appointment.customerName?.trim().slice(0, 2).toUpperCase() ??
      "—");

  return (
    <div className="grid grid-cols-12 items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40">
      <div className="col-span-2 flex flex-col">
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatTime(appointment.startISO)}
        </span>
        <span className="text-xs text-muted-foreground">
          {service ? formatDuration(service.durationMinutes) : "—"}
        </span>
      </div>

      <div className="col-span-3 flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {displayInitials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{displayPhone}</p>
        </div>
      </div>

      <div className="col-span-3 min-w-0">
        <p className="truncate text-sm text-foreground">
          {isBlock ? "—" : (service?.name ?? "—")}
        </p>
        <p className="truncate text-xs text-muted-foreground">{service?.category ?? ""}</p>
      </div>

      <div className="col-span-2 min-w-0 text-sm text-foreground truncate">
        {professional?.name ?? "—"}
      </div>

      <div className="col-span-1 text-sm tabular-nums text-foreground">
        {isBlock ? "—" : formatCurrency(appointment.priceCents)}
      </div>

      <div className="col-span-1 flex items-center justify-end gap-2">
        {isBlock ? (
          <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Blocked
          </span>
        ) : (
          <StatusBadge status={appointment.status} />
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
