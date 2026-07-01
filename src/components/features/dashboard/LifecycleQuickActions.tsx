import { useState } from "react";
import { Check, MoreHorizontal, UserX, X } from "lucide-react";
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

interface Props {
  appointment: Appointment;
}

/**
 * Compact lifecycle menu for the dashboard surfaces. Reuses the same
 * mutations + i18n strings as the full Appointments row so behavior /
 * gating / toasts stay consistent. Reschedule and edit are intentionally
 * not surfaced here.
 */
export function LifecycleQuickActions({ appointment }: Props) {
  const t = useT();
  const isBlock = appointment.type === "block";
  const cancelMut = useCancelBooking();
  const completeMut = useCompleteBooking();
  const noShowMut = useMarkNoShow();

  const canAct = !isBlock && appointment.status === "confirmed";
  const elapsed = Date.now() >= new Date(appointment.startISO).getTime();
  const [confirm, setConfirm] = useState<null | "cancel" | "no_show">(null);

  if (isBlock) return null;

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
          <DropdownMenuItem
            disabled={!elapsed || completeMut.isPending}
            onClick={() => completeMut.mutate(appointment.id)}
            title={!elapsed ? t.appointments.row.elapsedTooltip : undefined}
          >
            <Check className="mr-2 h-4 w-4" /> {t.appointments.row.markCompleted}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!elapsed}
            onClick={() => setConfirm("no_show")}
            title={!elapsed ? t.appointments.row.elapsedTooltip : undefined}
          >
            <UserX className="mr-2 h-4 w-4" /> {t.appointments.row.markNoShow}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirm("cancel")}
            className="text-destructive focus:text-destructive"
          >
            <X className="mr-2 h-4 w-4" /> {t.appointments.row.cancelBooking}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "cancel"
                ? t.appointments.row.cancelTitle
                : t.appointments.row.noShowTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "cancel"
                ? t.appointments.row.cancelDescription
                : t.appointments.row.noShowDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.appointments.row.back}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm === "cancel") cancelMut.mutate(appointment.id);
                if (confirm === "no_show") noShowMut.mutate(appointment.id);
                setConfirm(null);
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
