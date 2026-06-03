import { useQuery } from "@tanstack/react-query";
import { activeTenant } from "@/config/tenant";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import type { TenantInfo } from "@/lib/data-source/types";

const fallback: TenantInfo = { ...activeTenant, isLive: false, isActive: true };

export function useTenantQuery() {
  return useQuery<TenantInfo | null>({
    queryKey: qk.tenant,
    queryFn: () => dataSource.getTenant(),
    initialData: IS_SUPABASE ? undefined : fallback,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Backwards-compatible: returns a Tenant object synchronously. When the user
 * isn't linked to a tenant (supabase mode) we return the local placeholder so
 * the UI doesn't crash — the banner surfaces the "No tenant assigned" state.
 */
export function useTenant(): TenantInfo {
  const { data } = useTenantQuery();
  return data ?? fallback;
}
