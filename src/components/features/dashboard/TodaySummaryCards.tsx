import { StatCard } from "@/components/common/StatCard";
import { useT } from "@/i18n/useT";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { TodayCounts } from "@/lib/dashboard-today";

interface Props {
  counts: TodayCounts;
  estimatedRevenueCents: number;
}

export function TodaySummaryCards({ counts, estimatedRevenueCents }: Props) {
  const t = useT();
  const s = t.dashboard.today.summary;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard label={s.total} value={formatNumber(counts.total)} />
      <StatCard label={s.completed} value={formatNumber(counts.completed)} />
      <StatCard label={s.cancelled} value={formatNumber(counts.cancelled)} />
      <StatCard label={s.noShow} value={formatNumber(counts.noShow)} />
      <StatCard
        label={s.revenue}
        value={formatCurrency(estimatedRevenueCents)}
        hint={s.revenueHint}
      />
    </div>
  );
}
