import { toast } from "sonner";
import { SectionCard } from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";

export function BusinessProfileForm() {
  const t = useT();
  const tenant = useTenant();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Saved (mock)");
  };

  return (
    <SectionCard title={t.settings.business.title} description={t.settings.business.subtitle}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t.settings.business.name}</Label>
          <Input id="name" defaultValue={tenant.name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{t.settings.business.email}</Label>
          <Input id="email" type="email" defaultValue={tenant.email} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{t.settings.business.phone}</Label>
          <Input id="phone" defaultValue={tenant.phone} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tz">{t.settings.business.timezone}</Label>
          <Input id="tz" defaultValue={tenant.timezone} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="addr">{t.settings.business.address}</Label>
          <Input id="addr" defaultValue={tenant.address} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cur">{t.settings.business.currency}</Label>
          <Input id="cur" defaultValue={tenant.currency} />
        </div>

        <div className="flex items-end justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost">
            {t.common.cancel}
          </Button>
          <Button type="submit">{t.common.save}</Button>
        </div>
      </form>
    </SectionCard>
  );
}
