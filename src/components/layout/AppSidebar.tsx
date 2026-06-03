import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation } from "@/config/navigation";
import { useT } from "@/i18n/useT";
import { useTenant } from "@/hooks/useTenant";
import { CalendarClock } from "lucide-react";

function getNested(obj: unknown, path: string): string {
  return (
    (path.split(".").reduce<unknown>((acc, k) => {
      if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[k];
      }
      return undefined;
    }, obj) as string) ?? path
  );
}

export function AppSidebar() {
  const t = useT();
  const tenant = useTenant();
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) =>
    currentPath === path || (path !== "/" && currentPath.startsWith(path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarClock className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate font-display text-sm font-semibold leading-tight">
              {t.app.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">{tenant.name}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.id}>
            <SidebarGroupLabel>{getNested(t, section.labelKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to)}
                        tooltip={getNested(t, item.labelKey)}
                      >
                        <Link to={item.to}>
                          <Icon className="h-4 w-4" />
                          <span>{getNested(t, item.labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {tenant.logoInitials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium">{tenant.name}</span>
            <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              {tenant.industry}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
