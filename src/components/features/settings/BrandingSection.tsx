import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/common/SectionCard";
import { useTenant } from "@/hooks/useTenant";
import { useUpdateTenantProfile } from "@/hooks/useTenantProfile";
import { useT } from "@/i18n/useT";

/**
 * Branding: shows a live preview of logo_url (with onError fallback to
 * initials) and lets the manager edit the URL. Upload is intentionally
 * out of scope — only the URL field is wired.
 */
export function BrandingSection() {
  const t = useT();
  const tenant = useTenant();
  const update = useUpdateTenantProfile();
  const [value, setValue] = useState<string>(tenant.logoUrl ?? "");
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setValue(tenant.logoUrl ?? "");
    setImgFailed(false);
  }, [tenant.logoUrl]);

  const dirty = (tenant.logoUrl ?? "") !== value;
  const showImage = value.trim().length > 0 && !imgFailed;

  const onSave = () => {
    update.mutate({ logo_url: value.trim() === "" ? null : value.trim() });
  };

  return (
    <SectionCard title={t.settings.branding.title} description={t.settings.branding.subtitle}>
      <div className="flex items-center gap-4">
        {showImage ? (
          <img
            src={value}
            alt={tenant.name}
            className="h-16 w-16 rounded-xl object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            {tenant.logoInitials}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">
            Paste an image URL. Upload is not available yet.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <Label>Logo URL</Label>
        <Input
          value={value}
          placeholder="https://example.com/logo.png"
          onChange={(e) => {
            setValue(e.target.value);
            setImgFailed(false);
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => setValue(tenant.logoUrl ?? "")}
          disabled={!dirty || update.isPending}
        >
          Reset
        </Button>
        <Button onClick={onSave} disabled={!dirty || update.isPending}>
          {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </SectionCard>
  );
}
