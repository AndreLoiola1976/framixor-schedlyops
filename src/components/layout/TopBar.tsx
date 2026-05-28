import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useT } from "@/i18n/useT";
import { useTenant } from "@/hooks/useTenant";
import { Separator } from "@/components/ui/separator";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export function TopBar() {
  const t = useT();
  const tenant = useTenant();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Tenant switcher placeholder (disabled) */}
      <button
        type="button"
        disabled
        className="hidden h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-sm font-medium text-foreground/80 disabled:cursor-not-allowed disabled:opacity-90 md:flex"
        title="Multi-workspace coming soon"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-semibold text-primary-foreground">
          {tenant.logoInitials}
        </span>
        <span className="truncate max-w-[120px]">{tenant.name}</span>
      </button>

      <div className="relative ml-auto hidden w-full max-w-sm md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t.topbar.searchPlaceholder}
          className="h-9 pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 md:ml-0">
        <LocaleSwitcher />
        <Button variant="ghost" size="icon" aria-label={t.topbar.notifications}>
          <Bell className="h-4 w-4" />
        </Button>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.topbar.newAppointment}</span>
        </Button>
      </div>
    </header>
  );
}
