import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TenantSettingsSection } from "@/components/features/settings/TenantSettingsSection";
import { BusinessProfileForm } from "@/components/features/settings/BusinessProfileForm";
import { BrandingSection } from "@/components/features/settings/BrandingSection";
import { PublicBookingPageCard } from "@/components/features/settings/PublicBookingPageCard";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/useT";
import { useTenant } from "@/hooks/useTenant";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SchedlyOps" },
      { name: "description", content: "Workspace, branding, and business profile settings." },
      { property: "og:title", content: "Settings — SchedlyOps" },
      {
        property: "og:description",
        content: "Workspace, branding, and business profile settings.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const tenant = useTenant();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      <PublicBookingPageCard />

      <BusinessProfileForm />

      <TenantSettingsSection />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BrandingSection />
        <SectionCard title={t.settings.tenant.title} description={t.settings.tenant.subtitle}>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">{t.settings.tenant.idLabel}</dt>
              <dd className="font-mono text-xs">{tenant.id}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{t.settings.tenant.planLabel}</dt>
              <dd className="font-medium">{t.settings.tenant.planValue}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard
        title={t.settings.hours.perProfessionalTitle}
        description={t.settings.hours.perProfessionalSubtitle}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-prose text-sm text-muted-foreground">
            {t.settings.hours.perProfessionalBody}
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1.5 sm:shrink-0">
            <Link to="/professionals">
              <CalendarClock className="h-4 w-4" />
              {t.settings.hours.manageInProfessionals}
            </Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
