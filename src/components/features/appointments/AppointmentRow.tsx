import { useState } from "react";
import { MoreHorizontal, CalendarClock, Pencil, X, Check, UserX } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Appointment } from "@/types/appointment";
import type { Client } from "@/types/client";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import { formatCurrency, formatDuration, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCancelBooking,
  useCompleteBooking,
  useMarkNoShow,
} from "@/hooks/useSchedulingMutations";
import { RescheduleBookingDialog } from "./RescheduleBookingDialog";
import { EditBookingDialog } from "./EditBookingDialog";

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
    : (client?.initials ?? appointment.customerName?.trim().slice(0, 2).toUpperCase() ?? "—");

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "cancel" | "no_show">(null);

  const cancelMut = useCancelBooking();
  const completeMut = useCompleteBooking();
  const noShowMut = useMarkNoShow();

  const canAct = !isBlock && appointment.status === "confirmed";
  const elapsed = Date.now() >= new Date(appointment.startISO).getTime();

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
        <p className="truncate text-sm text-foreground">{isBlock ? "—" : (service?.name ?? "—")}</p>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open appointment actions"
              className="h-8 w-8 shrink-0 rounded-md"
              disabled={!canAct}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
              <CalendarClock className="mr-2 h-4 w-4" /> Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!elapsed || completeMut.isPending}
              onClick={() => completeMut.mutate(appointment.id)}
              title={!elapsed ? "Available after the appointment time has passed" : undefined}
            >
              <Check className="mr-2 h-4 w-4" /> Mark completed
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!elapsed}
              onClick={() => setConfirmAction("no_show")}
              title={!elapsed ? "Available after the appointment time has passed" : undefined}
            >
              <UserX className="mr-2 h-4 w-4" /> Mark no-show
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setConfirmAction("cancel")}
              className="text-destructive focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" /> Cancel booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RescheduleBookingDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={appointment}
      />
      <EditBookingDialog open={editOpen} onOpenChange={setEditOpen} appointment={appointment} />

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(o) => !o && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "cancel" ? "Cancel this booking?" : "Mark as no-show?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "cancel"
                ? "The slot will become available again. The customer will not be automatically notified."
                : "This records the customer as a no-show. This action is logged on the backend."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction === "cancel") cancelMut.mutate(appointment.id);
                if (confirmAction === "no_show") noShowMut.mutate(appointment.id);
                setConfirmAction(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
