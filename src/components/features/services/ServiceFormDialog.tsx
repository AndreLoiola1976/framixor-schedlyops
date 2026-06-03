import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/useT";
import { useCreateService, useUpdateService } from "@/hooks/useSchedulingMutations";
import type { Service } from "@/types/service";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  service?: Service | null;
}

export function ServiceFormDialog({ open, onOpenChange, service }: Props) {
  const t = useT();
  const create = useCreateService();
  const update = useUpdateService();
  const editing = !!service;

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (open) {
      setName(service?.name ?? "");
      setDuration(service?.durationMinutes ?? 30);
      setPrice(service?.priceCents ?? 0);
    }
  }, [open, service]);

  const pending = create.isPending || update.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing && service) {
      await update.mutateAsync({
        id: service.id,
        name,
        durationMinutes: duration,
        priceCents: price,
      });
    } else {
      await create.mutateAsync({ name, durationMinutes: duration, priceCents: price });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t.services.edit : t.services.create}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-name">{t.services.form.name}</Label>
            <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svc-dur">{t.services.form.durationMinutes}</Label>
              <Input
                id="svc-dur"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svc-price">{t.services.form.priceCents}</Label>
              <Input
                id="svc-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t.common.saving : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
