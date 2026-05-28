import { StatCard } from "@/components/common/StatCard";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useT } from "@/i18n/useT";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { MetricDefinition } from "@/types/metric";

function formatMetric(m: MetricDefinition): string {
  switch (m.format) {
    case "currency":
      return formatCurrency(m.value);
    case "percent":
      return formatPercent(m.value);
    default:
      return formatNumber(m.value);
  }
}

export function KpiGrid() {
  const { metrics } = useDashboardMetrics();
  const t = useT();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => {
        const label = (t.dashboard.metrics as Record<string, string>)[m.id] ?? m.id;
        return (
          <StatCard
            key={m.id}
            label={label}
            value={formatMetric(m)}
            deltaPercent={m.deltaPercent}
          />
        );
      })}
    </div>
  );
}
