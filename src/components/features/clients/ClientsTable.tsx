import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useT } from "@/i18n/useT";
import { formatCurrency, formatDate } from "@/lib/format";

export function ClientsTable() {
  const t = useT();
  const all = useClients();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query),
    );
  }, [all, q]);

  return (
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

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-12 gap-3 border-b border-border bg-muted/40 px-5 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">{t.clients.columns.name}</div>
          <div className="col-span-3">{t.clients.columns.contact}</div>
          <div className="col-span-1 text-right">{t.clients.columns.visits}</div>
          <div className="col-span-2">{t.clients.columns.lastVisit}</div>
          <div className="col-span-2 text-right">{t.clients.columns.ltv}</div>
        </div>
        <ul className="divide-y divide-border">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-12 items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {c.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {c.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-3 min-w-0 text-xs text-muted-foreground">
                <p className="truncate">{c.email}</p>
                <p className="truncate">{c.phone}</p>
              </div>
              <div className="col-span-1 text-right text-sm font-medium tabular-nums">
                {c.totalVisits}
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {c.lastVisitISO ? formatDate(c.lastVisitISO + "T00:00:00") : t.clients.never}
              </div>
              <div className="col-span-2 text-right text-sm font-semibold tabular-nums">
                {formatCurrency(c.lifetimeValueCents)}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
