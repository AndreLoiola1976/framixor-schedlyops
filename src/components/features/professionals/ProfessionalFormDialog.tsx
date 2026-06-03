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
import { useCreateProfessional, useUpdateProfessional } from "@/hooks/useSchedulingMutations";
import type { Professional } from "@/types/professional";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  professional?: Professional | null;
}

export function ProfessionalFormDialog({ open, onOpenChange, professional }: Props) {
  const t = useT();
  const create = useCreateProfessional();
  const update = useUpdateProfessional();
  const editing = !!professional;

  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(professional?.name ?? "");
  }, [open, professional]);

  const pending = create.isPending || update.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing && professional) {
      await update.mutateAsync({ id: professional.id, name });
    } else {
      await create.mutateAsync({ name });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t.professionals.edit : t.professionals.create}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pro-name">{t.professionals.form.name}</Label>
            <Input id="pro-name" value={name} onChange={(e) => setName(e.target.value)} required />
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
