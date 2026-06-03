import { TENANT_SLUG, IS_SUPABASE } from "@/lib/env";
import { useTenantQuery } from "@/hooks/useTenant";
import { AlertTriangle, Info } from "lucide-react";

export function TenantMismatchBanner() {
  const { data, isError, error, isLoading } = useTenantQuery();
  if (!IS_SUPABASE) return null;
  if (isLoading) return null;

  if (isError) {
    return (
      <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Tenant lookup failed: {(error as Error)?.message ?? "unknown error"}.</span>
        </div>
      </div>
    );
  }

  // No tenant linked to the signed-in user.
  if (!data || !data.isLive || !data.id) {
    return (
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-200">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            <strong>No tenant assigned.</strong> Your account isn&apos;t linked to a tenant yet. Ask
            an admin to grant access to <strong>{TENANT_SLUG}</strong>. The app is read-only until
            then.
          </span>
        </div>
      </div>
    );
  }

  if (data.slug === TENANT_SLUG) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-900 dark:text-amber-200">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          Signed-in tenant <strong>{data.slug}</strong> doesn&apos;t match the deployment slug{" "}
          <strong>{TENANT_SLUG}</strong>. Showing data for the authenticated tenant.
        </span>
      </div>
    </div>
  );
}
