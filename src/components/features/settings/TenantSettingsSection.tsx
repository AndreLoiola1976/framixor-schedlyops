import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "@/components/common/SectionCard";
import { useTenantSettings, useUpdateTenantSettings } from "@/hooks/useTenantSettings";
import type { TenantSettingsPatch } from "@/lib/tenant-settings";

export function TenantSettingsSection() {
  const { data, isLoading, error, isFetching } = useTenantSettings();
  const update = useUpdateTenantSettings();
  const [patch, setPatch] = useState<TenantSettingsPatch>({});

  // Reset local patch whenever server data refreshes.
  useEffect(() => {
    setPatch({});
  }, [data]);

  if (isLoading) {
    return (
      <SectionCard title="Workspace settings" description="Loading…">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching settings…
        </div>
      </SectionCard>
    );
  }
  if (error) {
    return (
      <SectionCard title="Workspace settings" description="Couldn't load settings">
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      </SectionCard>
    );
  }
  if (!data) {
    return (
      <SectionCard title="Workspace settings" description="No settings available">
        <p className="text-sm text-muted-foreground">
          Backend returned no row for operator_get_tenant_settings.
        </p>
      </SectionCard>
    );
  }

  const v = <K extends keyof TenantSettingsPatch>(k: K): TenantSettingsPatch[K] =>
    patch[k] !== undefined ? patch[k] : (data[k] as TenantSettingsPatch[K]);

  const set = <K extends keyof TenantSettingsPatch>(k: K, val: TenantSettingsPatch[K]) =>
    setPatch((p) => ({ ...p, [k]: val }));

  const dirty = Object.keys(patch).length > 0;

  return (
    <SectionCard
      title="Workspace settings"
      description="Operational defaults read from core.operator_get_tenant_settings."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReadOnly label="Slug" value={data.slug ?? "—"} />
        <ReadOnly label="Name" value={data.name ?? "—"} />

        <Field label="Timezone">
          <Input
            value={v("timezone") ?? ""}
            placeholder="e.g. America/Sao_Paulo"
            onChange={(e) => set("timezone", e.target.value)}
          />
        </Field>
        <Field label="Default locale">
          <Input
            value={v("default_locale") ?? ""}
            placeholder="e.g. en-US"
            onChange={(e) => set("default_locale", e.target.value)}
          />
        </Field>
        <Field label="Country code">
          <Input
            value={v("country_code") ?? ""}
            placeholder="e.g. US"
            onChange={(e) => set("country_code", e.target.value)}
          />
        </Field>
        <Field label="Self-reschedule cutoff (minutes)">
          <Input
            type="number"
            min={0}
            value={v("self_reschedule_cutoff_minutes") ?? ""}
            onChange={(e) =>
              set(
                "self_reschedule_cutoff_minutes",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </Field>
        <Field label="Late-cancel fee %">
          <Input
            type="number"
            min={0}
            max={100}
            value={v("late_cancel_fee_percent") ?? ""}
            onChange={(e) =>
              set("late_cancel_fee_percent", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </Field>
        <Field label="No-show fee %">
          <Input
            type="number"
            min={0}
            max={100}
            value={v("no_show_fee_percent") ?? ""}
            onChange={(e) =>
              set("no_show_fee_percent", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </Field>

        <Toggle
          label="Allow customer self-cancel"
          checked={!!v("allow_customer_self_cancel")}
          onChange={(c) => set("allow_customer_self_cancel", c)}
        />
        <Toggle
          label="Allow customer self-reschedule"
          checked={!!v("allow_customer_self_reschedule")}
          onChange={(c) => set("allow_customer_self_reschedule", c)}
        />
        <Toggle
          label="Payment required for booking"
          checked={!!v("payment_required_for_booking")}
          onChange={(c) => set("payment_required_for_booking", c)}
        />
        <Toggle
          label="Cancellation fee policy enabled"
          checked={!!v("cancellation_fee_policy_enabled")}
          onChange={(c) => set("cancellation_fee_policy_enabled", c)}
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {isFetching ? <span className="text-xs text-muted-foreground">Syncing…</span> : null}
        <Button variant="ghost" onClick={() => setPatch({})} disabled={!dirty || update.isPending}>
          Reset
        </Button>
        <Button onClick={() => update.mutate(patch)} disabled={!dirty || update.isPending}>
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded border border-border p-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
