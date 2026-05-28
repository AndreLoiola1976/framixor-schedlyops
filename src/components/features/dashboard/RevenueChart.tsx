import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionCard } from "@/components/common/SectionCard";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useT } from "@/i18n/useT";
import { formatCurrency } from "@/lib/format";

export function RevenueChart() {
  const t = useT();
  const { revenueSeries } = useDashboardMetrics();

  return (
    <SectionCard title={t.dashboard.revenueTitle} description={t.dashboard.revenueSubtitle}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueSeries} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCurrency(v).replace(/\.00$/, "")}
              width={70}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-border)" }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--color-popover-foreground)",
              }}
              formatter={(value: number, name) =>
                name === "revenue" ? [formatCurrency(value), "Revenue"] : [value, "Bookings"]
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fill="url(#revFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
