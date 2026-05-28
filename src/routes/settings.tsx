import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { BusinessProfileForm } from "@/components/features/settings/BusinessProfileForm";
import { BrandingSection } from "@/components/features/settings/BrandingSection";
import { SectionCard } from "@/components/common/SectionCard";
import { useT } from "@/i18n/useT";
import { useTenant } from "@/hooks/useTenant";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SchedlyOps" },
      { name: "description", content: "Workspace, branding, and business profile settings." },
      { property: "og:title", content: "Settings — SchedlyOps" },
      { property: "og:description", content: "Workspace, branding, and business profile settings." },
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

      <BusinessProfileForm />

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

      <SectionCard title={t.settings.hours.title} description={t.settings.hours.subtitle}>
        <ul className="divide-y divide-border">
          {tenant.hours.map((h) => (
            <li key={h.day} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-foreground">{t.days[h.day]}</span>
              {h.closed ? (
                <span className="text-muted-foreground">{t.settings.hours.closed}</span>
              ) : (
                <span className="tabular-nums text-foreground">
                  {h.open} – {h.close}
                </span>
              )}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
