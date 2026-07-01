import { useQuery } from "@tanstack/react-query";
import { getPublicTenantProfile, type PublicTenantProfile } from "../api/publicTenant";

export function publicTenantKey(slug: string) {
  return ["public-booking", "tenant", slug] as const;
}

export function usePublicTenant(slug: string) {
  return useQuery<PublicTenantProfile | null>({
    queryKey: publicTenantKey(slug),
    queryFn: () => getPublicTenantProfile(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
