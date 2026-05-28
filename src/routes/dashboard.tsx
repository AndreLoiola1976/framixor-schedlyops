import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiGrid } from "@/components/features/dashboard/KpiGrid";
import { RevenueChart } from "@/components/features/dashboard/RevenueChart";
import { UpcomingAppointments } from "@/components/features/dashboard/UpcomingAppointments";
import { TopServices } from "@/components/features/dashboard/TopServices";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SchedlyOps" },
      { name: "description", content: "Today's bookings, revenue, and operational metrics." },
      { property: "og:title", content: "Dashboard — SchedlyOps" },
      { property: "og:description", content: "Today's bookings, revenue, and operational metrics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
      <KpiGrid />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <UpcomingAppointments />
      </div>
      <TopServices />
    </div>
  );
}
