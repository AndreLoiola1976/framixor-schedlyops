import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/i18n/useT";
import { useProfessionals } from "@/hooks/useProfessionals";
import { cn } from "@/lib/utils";
import { QUICK_FILTERS, type QuickFilter } from "@/lib/appointments-filter";

export interface AppointmentFilterValue {
  quick: QuickFilter;
  professionalId: string | "all";
  search: string;
}

interface AppointmentFiltersProps {
  value: AppointmentFilterValue;
  onChange: (v: AppointmentFilterValue) => void;
}

export function AppointmentFilters({ value, onChange }: AppointmentFiltersProps) {
  const t = useT();
  const pros = useProfessionals();
  const quickLabels = t.appointments.quickFilters;

  return (
    <div className="flex flex-col gap-3">
      {/* Quick filter chips — horizontal scroll on mobile */}
      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label={t.common.filter}
      >
        {QUICK_FILTERS.map((q) => {
          const active = value.quick === q;
          return (
            <button
              key={q}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ ...value, quick: q })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {quickLabels[q]}
            </button>
          );
        })}
      </div>

      {/* Search + professional select */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder={t.appointments.searchPlaceholder}
            className="h-9 pl-8 pr-8 text-sm"
            aria-label={t.appointments.searchPlaceholder}
          />
          {value.search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t.common.cancel}
              onClick={() => onChange({ ...value, search: "" })}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>

        <Select
          value={value.professionalId}
          onValueChange={(v) => onChange({ ...value, professionalId: v })}
        >
          <SelectTrigger className="h-9 w-full text-xs sm:w-[200px]">
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
      </div>
    </div>
  );
}
