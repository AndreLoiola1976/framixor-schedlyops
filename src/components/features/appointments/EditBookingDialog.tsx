import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBooking } from "@/hooks/useSchedulingMutations";
import { useT } from "@/i18n/useT";
import { toUserMessage } from "@/lib/scheduling-errors";
import type { Appointment } from "@/types/appointment";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  appointment: Appointment;
}

export function EditBookingDialog({ open, onOpenChange, appointment }: Props) {
  const t = useT();
  const [name, setName] = useState(appointment.customerName ?? "");
  const [phone, setPhone] = useState(appointment.customerPhone ?? "");
  const [note, setNote] = useState(appointment.notes ?? "");

  useEffect(() => {
    if (open) {
      setName(appointment.customerName ?? "");
      setPhone(appointment.customerPhone ?? "");
      setNote(appointment.notes ?? "");
    }
  }, [open, appointment]);

  const mutation = useUpdateBooking();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patch: Parameters<typeof mutation.mutateAsync>[0] = { bookingId: appointment.id };
    if (name.trim() !== (appointment.customerName ?? "")) patch.customerName = name.trim();
    if (phone.trim() !== (appointment.customerPhone ?? "")) patch.customerPhone = phone.trim();
    if (note !== (appointment.notes ?? "")) patch.note = note;
    if (Object.keys(patch).length === 1) {
      onOpenChange(false);
      return;
    }
    try {
      await mutation.mutateAsync(patch);
      onOpenChange(false);
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.bookingDialog.edit.title}</DialogTitle>
          <DialogDescription>{t.bookingDialog.edit.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eb-name">{t.bookingDialog.edit.name}</Label>
            <Input id="eb-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eb-phone">{t.bookingDialog.edit.phone}</Label>
            <Input
              id="eb-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eb-note">{t.bookingDialog.edit.note}</Label>
            <Textarea
              id="eb-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
