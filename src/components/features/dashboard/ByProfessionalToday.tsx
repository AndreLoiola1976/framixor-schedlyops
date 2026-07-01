import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useT } from "@/i18n/useT";
import { formatTime } from "@/lib/format";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import type { ProfessionalDayBucket } from "@/lib/dashboard-today";

interface Props {
  buckets: ProfessionalDayBucket[];
  serviceMap: Record<string, Service>;
  professionalMap: Record<string, Professional>;
}

export function ByProfessionalToday({ buckets, serviceMap, professionalMap }: Props) {
  const t = useT();
  const s = t.dashboard.today.byPro;
  return (
    <SectionCard title={s.title} description={s.subtitle} contentClassName="p-0">
      <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
        {buckets.map((bucket) => {
          const pro = professionalMap[bucket.professionalId];
          return (
            <div key={bucket.professionalId} className="bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{pro?.name ?? "—"}</p>
                <span className="text-xs text-muted-foreground">{bucket.items.length}</span>
              </div>
              {bucket.items.length === 0 ? (
                <p className="text-xs text-muted-foreground">{s.emptyForPro}</p>
              ) : (
                <ul className="space-y-2">
                  {bucket.items.map((a) => {
                    const isBlock = a.type === "block";
                    const svc = serviceMap[a.serviceId];
                    return (
                      <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium tabular-nums text-foreground">
                          {formatTime(a.startISO)}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {isBlock ? s.blocked : `${a.customerName ?? "—"} · ${svc?.name ?? "—"}`}
                        </span>
                        {!isBlock ? <StatusBadge status={a.status} /> : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
