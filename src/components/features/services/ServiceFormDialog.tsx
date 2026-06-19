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
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(service?.name ?? "");
      setDuration(service?.durationMinutes ?? 30);
      setPriceInput(service ? (service.priceCents / 100).toFixed(2) : "");
      setPriceError(null);
    }
  }, [open, service]);

  const pending = create.isPending || update.isPending;

  function validatePrice(input: string): number | null {
    const normalized = input.trim().replace(",", ".");
    const parsed = Number(normalized);
    if (
      normalized === "" ||
      !Number.isFinite(parsed) ||
      parsed < 0
    ) {
      return null;
    }
    return Math.round(parsed * 100);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPriceError(null);
    const priceCents = validatePrice(priceInput);
    if (priceCents === null) {
      setPriceError(t.services.form.priceInvalid);
      return;
    }
    if (editing && service) {
      await update.mutateAsync({
        id: service.id,
        name,
        durationMinutes: duration,
        priceCents,
      });
    } else {
      await create.mutateAsync({ name, durationMinutes: duration, priceCents });
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
              <Label htmlFor="svc-price">{t.services.form.price}</Label>
              <Input
                id="svc-price"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="47.90"
                aria-invalid={!!priceError}
                aria-describedby={priceError ? "svc-price-error" : undefined}
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  if (priceError) setPriceError(null);
                }}
              />
              {priceError ? (
                <p id="svc-price-error" className="text-xs text-destructive">
                  {priceError}
                </p>
              ) : null}
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
