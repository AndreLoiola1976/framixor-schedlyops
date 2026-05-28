import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AppointmentsList } from "@/components/features/appointments/AppointmentsList";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — SchedlyOps" },
      { name: "description", content: "Manage upcoming and past appointments across your team." },
      { property: "og:title", content: "Appointments — SchedlyOps" },
      { property: "og:description", content: "Manage upcoming and past appointments across your team." },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        title={t.appointments.title}
        subtitle={t.appointments.subtitle}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t.appointments.new}
          </Button>
        }
      />
      <AppointmentsList />
    </div>
  );
}
