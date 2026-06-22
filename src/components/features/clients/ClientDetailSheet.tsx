import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useServiceMap } from "@/hooks/useServices";
import { useProfessionalMap } from "@/hooks/useProfessionals";
import { useT } from "@/i18n/useT";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { DerivedClient } from "@/lib/derive-clients";

interface ClientDetailSheetProps {
  client: DerivedClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailSheet({ client, open, onOpenChange }: ClientDetailSheetProps) {
  const t = useT();
  const services = useServiceMap();
  const pros = useProfessionalMap();

  if (!client) return null;

  const favPro = client.favoriteProfessionalId
    ? pros[client.favoriteProfessionalId]?.name
    : null;
  const favSvc = client.favoriteServiceId ? services[client.favoriteServiceId]?.name : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              {client.initials}
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate">{client.name}</SheetTitle>
              <SheetDescription className="truncate">
                {client.phone || t.clients.noPhone}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t.clients.detail.totalAppointments} value={client.totalBookings} />
          <Stat label={t.clients.detail.completed} value={client.completedCount} />
          <Stat label={t.clients.detail.cancelled} value={client.cancelledCount} />
          <Stat label={t.clients.detail.noShow} value={client.noShowCount} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label={t.clients.detail.favoriteProfessional} value={favPro ?? "—"} />
          <InfoRow label={t.clients.detail.favoriteService} value={favSvc ?? "—"} />
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            {t.clients.detail.history}
          </h3>
          {client.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.clients.detail.noHistory}</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {client.bookings.map((b) => {
                const svc = services[b.serviceId]?.name ?? "—";
                const pro = pros[b.professionalId]?.name ?? "—";
                return (
                  <li key={b.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{formatDate(b.startISO)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(b.startISO)} · {svc} · {pro}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={b.status} />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatCurrency(b.priceCents)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-foreground">{value}</p>
    </div>
  );
}
