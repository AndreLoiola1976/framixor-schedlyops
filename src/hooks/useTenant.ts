import { useQuery } from "@tanstack/react-query";
import { activeTenant } from "@/config/tenant";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import type { TenantInfo } from "@/lib/data-source/types";

const fallback: TenantInfo = { ...activeTenant, isLive: false, isActive: true };

export function useTenantQuery() {
  return useQuery({
    queryKey: qk.tenant,
    queryFn: () => dataSource.getTenant(),
    initialData: IS_SUPABASE ? undefined : fallback,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Backwards-compatible: returns a Tenant object synchronously. In supabase
 * mode, before the query resolves, returns a placeholder so the UI doesn't
 * crash; the real value swaps in on resolve.
 */
export function useTenant(): TenantInfo {
  const { data } = useTenantQuery();
  return data ?? fallback;
}
