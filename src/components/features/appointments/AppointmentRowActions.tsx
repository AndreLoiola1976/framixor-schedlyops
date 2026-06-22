import { useState } from "react";
import { MoreHorizontal, CalendarClock, Pencil, X, Check, UserX } from "lucide-react";
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
import { useT } from "@/i18n/useT";
import type { Appointment } from "@/types/appointment";
import { RescheduleBookingDialog } from "./RescheduleBookingDialog";
import { EditBookingDialog } from "./EditBookingDialog";

interface Props {
  appointment: Appointment;
}

/**
 * Behavior-preserving extraction of the actions menu from `AppointmentRow`.
 * Reused by the desktop row and the mobile card. Lifecycle mutations,
 * gating, and confirmation dialogs are unchanged.
 */
export function AppointmentRowActions({ appointment }: Props) {
  const t = useT();
  const isBlock = appointment.type === "block";

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "cancel" | "no_show">(null);

  const cancelMut = useCancelBooking();
  const completeMut = useCompleteBooking();
  const noShowMut = useMarkNoShow();

  const canAct = !isBlock && appointment.status === "confirmed";
  const elapsed = Date.now() >= new Date(appointment.startISO).getTime();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.appointments.row.openActions}
            className="h-8 w-8 shrink-0 rounded-md"
            disabled={!canAct}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRescheduleOpen(true)}>
            <CalendarClock className="mr-2 h-4 w-4" /> {t.appointments.row.reschedule}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> {t.appointments.row.editDetails}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!elapsed || completeMut.isPending}
            onClick={() => completeMut.mutate(appointment.id)}
            title={!elapsed ? t.appointments.row.elapsedTooltip : undefined}
          >
            <Check className="mr-2 h-4 w-4" /> {t.appointments.row.markCompleted}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!elapsed}
            onClick={() => setConfirmAction("no_show")}
            title={!elapsed ? t.appointments.row.elapsedTooltip : undefined}
          >
            <UserX className="mr-2 h-4 w-4" /> {t.appointments.row.markNoShow}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmAction("cancel")}
            className="text-destructive focus:text-destructive"
          >
            <X className="mr-2 h-4 w-4" /> {t.appointments.row.cancelBooking}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RescheduleBookingDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={appointment}
      />
      <EditBookingDialog open={editOpen} onOpenChange={setEditOpen} appointment={appointment} />

      <AlertDialog open={confirmAction !== null} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "cancel"
                ? t.appointments.row.cancelTitle
                : t.appointments.row.noShowTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "cancel"
                ? t.appointments.row.cancelDescription
                : t.appointments.row.noShowDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.appointments.row.back}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction === "cancel") cancelMut.mutate(appointment.id);
                if (confirmAction === "no_show") noShowMut.mutate(appointment.id);
                setConfirmAction(null);
              }}
            >
              {t.appointments.row.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
