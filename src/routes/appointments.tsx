import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AppointmentsList } from "@/components/features/appointments/AppointmentsList";
import { CreateBookingDialog } from "@/components/features/appointments/CreateBookingDialog";
import { useT } from "@/i18n/useT";
import { IS_SUPABASE } from "@/lib/env";
import { useSession } from "@/hooks/useSession";
import { useTenant } from "@/hooks/useTenant";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — SchedlyOps" },
      { name: "description", content: "Manage upcoming and past appointments across your team." },
      { property: "og:title", content: "Appointments — SchedlyOps" },
      {
        property: "og:description",
        content: "Manage upcoming and past appointments across your team.",
      },
    ],
  }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const t = useT();
  const { session } = useSession();
  const tenant = useTenant();
  const [open, setOpen] = useState(false);

  const canCreate = IS_SUPABASE && !!session?.user?.id && !!tenant.slug;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        title={t.appointments.title}
        subtitle={t.appointments.subtitle}
        actions={
          canCreate ? (
            <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.appointments.new}
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button size="sm" className="gap-1.5 pointer-events-none opacity-60" disabled>
                    <Plus className="h-4 w-4" />
                    {t.appointments.new}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {IS_SUPABASE
                  ? "Sign in and ensure your account is linked to a workspace to create bookings."
                  : t.topbar.newAppointmentDisabledTooltip}
              </TooltipContent>
            </Tooltip>
          )
        }
      />
      <AppointmentsList />
      {canCreate && <CreateBookingDialog open={open} onOpenChange={setOpen} />}
    </div>
  );
}
