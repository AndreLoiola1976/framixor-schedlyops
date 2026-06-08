import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useRescheduleBooking } from "@/hooks/useSchedulingMutations";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";
import { SlotTakenError } from "@/lib/booking-public";
import { toUserMessage } from "@/lib/scheduling-errors";
import type { Appointment } from "@/types/appointment";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  appointment: Appointment;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatSlotTime(iso: string, timezone: string | undefined): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function RescheduleBookingDialog({ open, onOpenChange, appointment }: Props) {
  const tenant = useTenant();
  const t = useT();
  const [date, setDate] = useState<Date | undefined>(() => new Date(appointment.startISO));
  const [slot, setSlot] = useState<string>("");
  const dateKey = useMemo(() => (date ? toDateKey(date) : undefined), [date]);

  useEffect(() => {
    setSlot("");
  }, [dateKey]);

  useEffect(() => {
    if (open) {
      setDate(new Date(appointment.startISO));
      setSlot("");
    }
  }, [open, appointment.startISO]);

  const slotsQuery = useAvailableSlots({
    tenantSlug: tenant.slug || undefined,
    professionalId: appointment.professionalId,
    serviceId: appointment.serviceId,
    date: dateKey,
  });
  const slots = slotsQuery.data ?? [];

  const mutation = useRescheduleBooking();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return;
    try {
      await mutation.mutateAsync({ bookingId: appointment.id, newStartsAt: slot });
      toast.success(t.bookingDialog.reschedule.success);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof SlotTakenError) {
        toast.error(t.bookingDialog.reschedule.slotTaken);
        setSlot("");
      } else {
        toast.error(toUserMessage(err));
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.bookingDialog.reschedule.title}</DialogTitle>
          <DialogDescription>{t.bookingDialog.reschedule.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t.bookingDialog.reschedule.newDate}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>{t.bookingDialog.create.pickDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rb-slot">{t.bookingDialog.reschedule.newTime}</Label>
            <Select value={slot} onValueChange={setSlot} disabled={slotsQuery.isFetching}>
              <SelectTrigger id="rb-slot">
                <SelectValue
                  placeholder={
                    slotsQuery.isFetching
                      ? t.bookingDialog.create.timeLoading
                      : slots.length === 0
                        ? t.bookingDialog.create.timeNoSlots
                        : t.bookingDialog.create.timeReady
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {slots.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatSlotTime(s, tenant.timezone)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!slot || mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.bookingDialog.reschedule.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
