import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { KpiGrid } from "@/components/features/dashboard/KpiGrid";
import { RevenueChart } from "@/components/features/dashboard/RevenueChart";
import { UpcomingAppointments } from "@/components/features/dashboard/UpcomingAppointments";
import { TopServices } from "@/components/features/dashboard/TopServices";
import { TodaySummaryCards } from "@/components/features/dashboard/TodaySummaryCards";
import { NextAppointmentCard } from "@/components/features/dashboard/NextAppointmentCard";
import { TodayScheduleList } from "@/components/features/dashboard/TodayScheduleList";
import { ByProfessionalToday } from "@/components/features/dashboard/ByProfessionalToday";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useAppointments } from "@/hooks/useAppointments";
import { useProfessionals, useProfessionalMap } from "@/hooks/useProfessionals";
import { useServiceMap } from "@/hooks/useServices";
import { useTenant } from "@/hooks/useTenant";
import { useTodayKey } from "@/lib/today-key";
import { deriveDashboardToday } from "@/lib/dashboard-today";
import { useT } from "@/i18n/useT";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SchedlyOps" },
      { name: "description", content: "Today's bookings and operational metrics." },
      { property: "og:title", content: "Dashboard — SchedlyOps" },
      { property: "og:description", content: "Today's bookings and operational metrics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const t = useT();
  const { derived } = useDashboardMetrics();
  const tenant = useTenant();
  const todayKey = useTodayKey(tenant.timezone);
  const appointments = useAppointments();
  const professionals = useProfessionals();
  const serviceMap = useServiceMap();
  const professionalMap = useProfessionalMap();

  const today = useMemo(
    () => (todayKey ? deriveDashboardToday(appointments, todayKey, professionals) : null),
    [appointments, todayKey, professionals],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        actions={
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            {t.dashboard.previewBadge}
          </Badge>
        }
      />
      <KpiGrid />
      {derived && today ? (
        <>
          <TodaySummaryCards
            counts={today.counts}
            estimatedRevenueCents={today.estimatedRevenueCents}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TodayScheduleList
                appointments={today.todayAppointments}
                serviceMap={serviceMap}
                professionalMap={professionalMap}
              />
            </div>
            <NextAppointmentCard
              appointment={today.nextAppointment}
              service={
                today.nextAppointment ? serviceMap[today.nextAppointment.serviceId] : undefined
              }
              professional={
                today.nextAppointment
                  ? professionalMap[today.nextAppointment.professionalId]
                  : undefined
              }
            />
          </div>
          <ByProfessionalToday
            buckets={today.byProfessional}
            serviceMap={serviceMap}
            professionalMap={professionalMap}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <UpcomingAppointments />
          </div>
          <TopServices />
        </>
      )}
    </div>
  );
}
