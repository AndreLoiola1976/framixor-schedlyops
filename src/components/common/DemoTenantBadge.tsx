import { useTenant } from "@/hooks/useTenant";

/**
 * Non-intrusive strip shown inside the operator panel shell when the active
 * tenant is the shared demo/training workspace. Deliberately hardcoded to the
 * `demo-barber` slug — this is a Founder Preview safety indicator, not a
 * generalized environment banner. English-only by design (fix-only scope).
 */
export function DemoTenantBadge() {
  const tenant = useTenant();
  if (tenant.slug !== "demo-barber") return null;
  return (
    <div
      role="status"
      aria-label="Demo tenant — training environment"
      className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
      <span className="font-medium tracking-wide">
        Demo tenant — training environment
      </span>
    </div>
  );
}
