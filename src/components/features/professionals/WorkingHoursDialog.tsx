import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/i18n/useT";
import { useWorkingHoursQuery } from "@/hooks/useWorkingHours";
import { useUpsertWorkingHours } from "@/hooks/useSchedulingMutations";
import type { Professional } from "@/types/professional";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  professional: Professional;
}

const DEFAULTS = {
  weekday: 1,
  opensAt: "09:00:00",
  closesAt: "17:00:00",
  slotMinutes: 30,
};

export function WorkingHoursDialog({ open, onOpenChange, professional }: Props) {
  const t = useT();
  const { data: hours } = useWorkingHoursQuery(open ? professional.id : undefined);
  const upsert = useUpsertWorkingHours();
  const [draft, setDraft] = useState<typeof DEFAULTS>(DEFAULTS);

  const active = (hours ?? []).filter((h) => h.isActive);

  async function addWindow() {
    await upsert.mutateAsync({
      professionalId: professional.id,
      weekday: draft.weekday,
      opensAt: draft.opensAt,
      closesAt: draft.closesAt,
      slotMinutes: draft.slotMinutes,
      isActive: true,
    });
    setDraft(DEFAULTS);
  }

  async function disable(id: string) {
    const row = active.find((h) => h.id === id);
    if (!row) return;
    await upsert.mutateAsync({
      id: row.id,
      professionalId: row.professionalId,
      weekday: row.weekday,
      opensAt: row.opensAt,
      closesAt: row.closesAt,
      slotMinutes: row.slotMinutes,
      isActive: false,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.workingHours.title}</DialogTitle>
          <DialogDescription>
            {t.workingHours.forProfessional.replace("{name}", professional.name)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.workingHours.empty}</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {active
                .slice()
                .sort((a, b) => a.weekday - b.weekday || a.opensAt.localeCompare(b.opensAt))
                .map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="font-medium w-12">{t.weekday.short[h.weekday]}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {h.opensAt.slice(0, 5)} – {h.closesAt.slice(0, 5)}
                    </span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {h.slotMinutes} min
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => disable(h.id)}
                      disabled={upsert.isPending}
                      aria-label={t.workingHours.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
            </ul>
          )}

          <div className="grid grid-cols-2 gap-3 rounded-md border border-dashed border-border p-3 md:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t.workingHours.weekday}</Label>
              <Select
                value={String(draft.weekday)}
                onValueChange={(v) => setDraft({ ...draft, weekday: Number(v) })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {t.weekday.short.map((label, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t.workingHours.opensAt}</Label>
              <Input
                type="time"
                value={draft.opensAt.slice(0, 5)}
                onChange={(e) => setDraft({ ...draft, opensAt: `${e.target.value}:00` })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t.workingHours.closesAt}</Label>
              <Input
                type="time"
                value={draft.closesAt.slice(0, 5)}
                onChange={(e) => setDraft({ ...draft, closesAt: `${e.target.value}:00` })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t.workingHours.slotMinutes}</Label>
              <Input
                type="number"
                min={1}
                value={draft.slotMinutes}
                onChange={(e) => setDraft({ ...draft, slotMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                className="w-full gap-1.5"
                onClick={addWindow}
                disabled={upsert.isPending}
              >
                <Plus className="h-4 w-4" />
                {t.workingHours.add}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
