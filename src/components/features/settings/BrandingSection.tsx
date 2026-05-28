import { SectionCard } from "@/components/common/SectionCard";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";

export function BrandingSection() {
  const t = useT();
  const tenant = useTenant();
  return (
    <SectionCard title={t.settings.branding.title} description={t.settings.branding.subtitle}>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
          {tenant.logoInitials}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">{t.settings.branding.logoNote}</p>
        </div>
      </div>
    </SectionCard>
  );
}
