import { useMemo, useState } from "react";
import { Search, Phone, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useDerivedClients } from "@/hooks/useDerivedClients";
import { useServiceMap } from "@/hooks/useServices";
import { useProfessionalMap } from "@/hooks/useProfessionals";
import { searchClients, type DerivedClient } from "@/lib/derive-clients";
import { useT } from "@/i18n/useT";
import { formatDate, formatTime } from "@/lib/format";
import { ClientDetailSheet } from "./ClientDetailSheet";

export function ClientsList() {
  const t = useT();
  const all = useDerivedClients();
  const services = useServiceMap();
  const pros = useProfessionalMap();
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => searchClients(all, q), [all, q]);
  const selected = useMemo(
    () => (selectedId ? (all.find((c) => c.id === selectedId) ?? null) : null),
    [all, selectedId],
  );

  const renderApptCell = (b: DerivedClient["nextAppointment"]) => {
    if (!b) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex flex-col">
        <span className="text-sm">{formatDate(b.startISO)}</span>
        <span className="text-xs text-muted-foreground">{formatTime(b.startISO)}</span>
      </div>
    );
  };

  if (all.length === 0) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">{t.clients.emptyState}</Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.clients.searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            {t.clients.emptySearch}
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-12 gap-3 border-b border-border bg-muted/40 px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <div className="col-span-3">{t.clients.columns.name}</div>
              <div className="col-span-2">{t.clients.columns.phone}</div>
              <div className="col-span-1 text-right">{t.clients.columns.totalBookings}</div>
              <div className="col-span-2">{t.clients.columns.nextVisit}</div>
              <div className="col-span-2">{t.clients.columns.lastVisit}</div>
              <div className="col-span-2">{t.clients.columns.lastService}</div>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((c) => {
                const lastSvc = c.lastAppointment
                  ? services[c.lastAppointment.serviceId]?.name
                  : null;
                const lastPro = c.lastAppointment
                  ? pros[c.lastAppointment.professionalId]?.name
                  : null;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className="w-full text-left transition-colors hover:bg-muted/40 focus:bg-muted/40 focus:outline-none"
                    >
                      {/* Desktop row */}
                      <div className="hidden md:grid grid-cols-12 items-center gap-3 px-5 py-3">
                        <div className="col-span-3 flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                            {c.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                          </div>
                        </div>
                        <div className="col-span-2 min-w-0 text-xs text-muted-foreground">
                          <p className="truncate">{c.phone || t.clients.noPhone}</p>
                        </div>
                        <div className="col-span-1 text-right text-sm font-medium tabular-nums">
                          {c.totalBookings}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {renderApptCell(c.nextAppointment)}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {c.lastAppointment ? (
                            <div className="flex flex-col gap-1">
                              {renderApptCell(c.lastAppointment)}
                              <StatusBadge status={c.lastAppointment.status} />
                            </div>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground min-w-0">
                          {lastSvc ? (
                            <>
                              <p className="truncate">{lastSvc}</p>
                              {lastPro && <p className="truncate opacity-75">{lastPro}</p>}
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden flex items-center gap-3 px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                          {c.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" aria-hidden />
                            {c.phone || t.clients.noPhone}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t.clients.mobile.bookings(c.totalBookings)}
                            {c.nextAppointment
                              ? ` · ${t.clients.mobile.next} ${formatDate(c.nextAppointment.startISO)}`
                              : c.lastAppointment
                                ? ` · ${t.clients.mobile.last} ${formatDate(c.lastAppointment.startISO)}`
                                : ""}
                          </p>
                        </div>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <ClientDetailSheet
        client={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </>
  );
}
