import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Professional } from "@/types/professional";
import { useServices } from "@/hooks/useServices";
import { useT } from "@/i18n/useT";
import { Mail, Phone } from "lucide-react";

interface ProfessionalCardProps {
  pro: Professional;
}

export function ProfessionalCard({ pro }: ProfessionalCardProps) {
  const t = useT();
  const services = useServices();
  const servicesCount = services.filter((s) => s.professionalIds.includes(pro.id)).length;

  return (
    <Card className="transition-colors hover:border-foreground/20">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {pro.initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-foreground">
              {pro.name}
            </h3>
            <p className="truncate text-xs text-muted-foreground">{pro.role}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px]">
              {s}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" /> {pro.email}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" /> {pro.phone}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.professionals.workingHours}
            </span>
            <span className="font-medium text-foreground">
              {pro.workingDays} · {pro.workingHours}
            </span>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium tabular-nums">
            {servicesCount} {t.professionals.services}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
