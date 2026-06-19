import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/common/SectionCard";
import { useTenantProfile, useUpdateTenantProfile } from "@/hooks/useTenantProfile";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";
import type { TenantProfilePatch } from "@/lib/tenant-profile";

/**
 * Editable business profile, backed by core.operator_(get|update)_tenant_profile.
 *
 * Editable fields use the confirmed RPC parameter names. tenants.name is NOT
 * editable from here — display_name is the public branding string. public_email
 * and currency remain read-only for this pass.
 */
export function BusinessProfileForm() {
  const t = useT();
  const tenant = useTenant();
  const { data, isLoading, error, isFetching } = useTenantProfile();
  const update = useUpdateTenantProfile();
  const [patch, setPatch] = useState<TenantProfilePatch>({});

  useEffect(() => {
    setPatch({});
  }, [data]);

  if (isLoading) {
    return (
      <SectionCard title={t.settings.business.title} description="Loading…">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching profile…
        </div>
      </SectionCard>
    );
  }
  if (error) {
    return (
      <SectionCard title={t.settings.business.title} description="Couldn't load profile">
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      </SectionCard>
    );
  }

  const profile = data;
  const v = <K extends keyof TenantProfilePatch>(k: K): string => {
    const inPatch = patch[k];
    if (inPatch !== undefined) return (inPatch as string | null) ?? "";
    const fromServer = profile?.[k];
    return typeof fromServer === "string" ? fromServer : "";
  };
  const set = (k: keyof TenantProfilePatch, val: string) =>
    setPatch((p) => ({ ...p, [k]: val === "" ? null : val }));

  const dirty = Object.keys(patch).length > 0;

  const country = (v("country_code") || tenant.countryCode || "").toUpperCase();
  const phonePlaceholder =
    country === "US"
      ? "+1 203 555 0199"
      : country === "BR"
        ? "+55 11 90000-0000"
        : "+1 555 000 0000";
  const countryPlaceholder = country || "US";

  const normalizeUSPhone = (raw: string): string => {
    const trimmed = raw.trim();
    if (country !== "US") return trimmed;
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return trimmed;
  };

  const onSave = () => {
    if (!dirty) return;
    const next: TenantProfilePatch = { ...patch };
    if (typeof next.public_phone === "string" && next.public_phone.trim() !== "") {
      next.public_phone = normalizeUSPhone(next.public_phone);
    }
    update.mutate(next);
  };

  return (
    <SectionCard title={t.settings.business.title} description={t.settings.business.subtitle}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Display name">
          <Input
            value={v("display_name")}
            placeholder={tenant.name}
            onChange={(e) => set("display_name", e.target.value)}
          />
        </Field>
        <Field label="Tagline">
          <Input
            value={v("tagline")}
            placeholder="One-line summary"
            onChange={(e) => set("tagline", e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea
              value={v("description")}
              rows={3}
              placeholder="Short description shown on your public page"
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </div>

        <Field label={`${t.settings.business.phone} (public)`}>
          <Input
            value={v("public_phone")}
            placeholder="+55 11 90000-0000"
            onChange={(e) => set("public_phone", e.target.value)}
          />
        </Field>
        <Field label="Website URL">
          <Input
            value={v("website_url")}
            placeholder="https://example.com"
            onChange={(e) => set("website_url", e.target.value)}
          />
        </Field>

        <Field label="Address line 1">
          <Input
            value={v("address_line1")}
            onChange={(e) => set("address_line1", e.target.value)}
          />
        </Field>
        <Field label="Address line 2">
          <Input
            value={v("address_line2")}
            onChange={(e) => set("address_line2", e.target.value)}
          />
        </Field>
        <Field label="City">
          <Input value={v("city")} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="State / Region">
          <Input value={v("state")} onChange={(e) => set("state", e.target.value)} />
        </Field>
        <Field label="Postal code">
          <Input value={v("postal_code")} onChange={(e) => set("postal_code", e.target.value)} />
        </Field>
        <Field label="Country code">
          <Input
            value={v("country_code")}
            placeholder="BR"
            onChange={(e) => set("country_code", e.target.value)}
          />
        </Field>

        <ReadOnly
          label={`${t.settings.business.email} (public)`}
          value={profile?.public_email || "—"}
        />
        <ReadOnly label={t.settings.business.currency} value={tenant.currency || "—"} />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Public email and currency are read-only in this pass. Currency lives in workspace settings.
      </p>

      <div className="mt-4 flex items-center justify-end gap-2">
        {isFetching ? <span className="text-xs text-muted-foreground">Syncing…</span> : null}
        <Button variant="ghost" onClick={() => setPatch({})} disabled={!dirty || update.isPending}>
          Reset
        </Button>
        <Button onClick={onSave} disabled={!dirty || update.isPending}>
          {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </SectionCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <Input value={value} readOnly disabled />
    </div>
  );
}
