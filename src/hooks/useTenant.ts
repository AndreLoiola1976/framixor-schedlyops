import { useQuery } from "@tanstack/react-query";
import { activeTenant } from "@/config/tenant";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import type { TenantInfo } from "@/lib/data-source/types";

// Mock-mode fallback uses the local placeholder tenant so the demo UI keeps
// its branding. Supabase-mode fallback is a neutral stub so a missing /
// loading / errored tenant lookup never crashes downstream `.split()` /
// initials / name formatting and never leaks the mock brand.
const mockFallback: TenantInfo = { ...activeTenant, isLive: false, isActive: true };
// Supabase-mode fallback: deliberately neutral. Never inherit mock contact /
// timezone / address / currency from activeTenant — those are demo data and
// would otherwise leak into a real tenant's UI whenever the backend payload
// is missing fields.
const supabaseFallback: TenantInfo = {
  id: "",
  name: "Workspace",
  slug: "",
  industry: "",
  email: "",
  phone: "",
  address: "",
  timezone: "",
  currency: "",
  locale: "",
  logoInitials: "--",
  hours: [],
  isLive: false,
  isActive: false,
};
const fallback: TenantInfo = IS_SUPABASE ? supabaseFallback : mockFallback;

export function useTenantQuery() {
  const { session, loading } = useSession();
  const userId = session?.user?.id;

  return useQuery<TenantInfo | null>({
    // Key by user so a re-login refetches and sign-out drops cached tenant.
    queryKey: IS_SUPABASE ? [...qk.tenant, userId ?? "anon"] : qk.tenant,
    queryFn: () => dataSource.getTenant(),
    // Gate on a confirmed session in Supabase mode. Mock mode runs immediately.
    enabled: IS_SUPABASE ? !loading && !!userId : true,
    initialData: IS_SUPABASE ? undefined : mockFallback,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Backwards-compatible: returns a Tenant object synchronously. When the user
 * isn't linked to a tenant (supabase mode) we return a neutral placeholder so
 * the UI doesn't crash — the banner surfaces the "No tenant assigned" state.
 */
export function useTenant(): TenantInfo {
  const { data } = useTenantQuery();
  return data ?? fallback;
}
