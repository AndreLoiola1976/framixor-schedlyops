import { SectionCard } from "@/components/common/SectionCard";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";

/**
 * Read-only business profile display.
 *
 * Migration 0023 does NOT expose RPCs to update name / email / phone /
 * address / currency on a tenant, so editing here would be a mock save and
 * silently drop user input. Operational fields that *are* backend-writable
 * (timezone, locale, country, self-service policies, fees) live in
 * `TenantSettingsSection` via `core.operator_update_tenant_settings`.
 *
 * When the backend ships business-profile RPCs, restore editable fields and
 * wire them through a new `useUpdateBusinessProfile` hook.
 */
export function BusinessProfileForm() {
  const t = useT();
  const tenant = useTenant();

  const rows: Array<{ label: string; value: string }> = [
    { label: t.settings.business.name, value: tenant.name || "—" },
    { label: t.settings.business.email, value: tenant.email || "—" },
    { label: t.settings.business.phone, value: tenant.phone || "—" },
    { label: t.settings.business.address, value: tenant.address || "—" },
    { label: t.settings.business.currency, value: tenant.currency || "—" },
  ];

  return (
    <SectionCard title={t.settings.business.title} description={t.settings.business.subtitle}>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-1">
            <Label className="text-muted-foreground">{r.label}</Label>
            <dd className="text-sm text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Editing business profile fields is not yet available. Operational settings (timezone,
        policies, fees) can be edited in Workspace settings below.
      </p>
    </SectionCard>
  );
}
