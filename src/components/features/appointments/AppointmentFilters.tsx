import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/i18n/useT";
import { useProfessionals } from "@/hooks/useProfessionals";
import { allStatuses } from "@/config/statuses";
import type { AppointmentStatus } from "@/types/appointment";

export interface AppointmentFilterValue {
  status: AppointmentStatus | "all";
  professionalId: string | "all";
}

interface AppointmentFiltersProps {
  value: AppointmentFilterValue;
  onChange: (v: AppointmentFilterValue) => void;
}

export function AppointmentFilters({ value, onChange }: AppointmentFiltersProps) {
  const t = useT();
  const pros = useProfessionals();
  const [open, setOpen] = useState(true); // visual scaffolding; always shown
  void open;
  void setOpen;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        {t.common.filter}
      </div>

      <Select
        value={value.status}
        onValueChange={(v) =>
          onChange({ ...value, status: v as AppointmentFilterValue["status"] })
        }
      >
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.appointments.filters.all}</SelectItem>
          {allStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {t.status[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.professionalId}
        onValueChange={(v) => onChange({ ...value, professionalId: v })}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.appointments.filters.professional}</SelectItem>
          {pros.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" className="h-8 text-xs" disabled>
        {t.appointments.filters.range}
      </Button>
    </div>
  );
}
