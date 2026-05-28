import { Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/types/service";
import { formatCurrency, formatDuration } from "@/lib/format";
import { useT } from "@/i18n/useT";
import { useProfessionalMap } from "@/hooks/useProfessionals";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const t = useT();
  const proMap = useProfessionalMap();
  const pros = service.professionalIds.map((id) => proMap[id]).filter(Boolean);

  return (
    <Card className="group transition-colors hover:border-foreground/20">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider">
              {service.category}
            </Badge>
            <h3 className="truncate font-display text-base font-semibold text-foreground">
              {service.name}
            </h3>
          </div>
          <div className="text-right">
            <div className="font-display text-lg font-semibold tabular-nums">
              {formatCurrency(service.priceCents)}
            </div>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{service.description}</p>

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(service.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {pros.length} {t.professionals.services.replace("services", "pros")}
          </span>
          <span
            className={
              service.active
                ? "inline-flex items-center gap-1.5 font-medium text-success"
                : "inline-flex items-center gap-1.5 font-medium text-muted-foreground"
            }
          >
            <span
              className={
                service.active
                  ? "h-1.5 w-1.5 rounded-full bg-success"
                  : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
              }
            />
            {service.active ? t.common.active : t.common.inactive}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
