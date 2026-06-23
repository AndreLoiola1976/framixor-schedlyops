import { useQuery } from "@tanstack/react-query";
import { listPublicServices, type PublicService } from "../api/publicServices";
import { listPublicProfessionals, type PublicProfessional } from "../api/publicProfessionals";

export function publicServicesKey(slug: string) {
  return ["public-booking", "services", slug] as const;
}

export function publicProfessionalsKey(slug: string) {
  return ["public-booking", "professionals", slug] as const;
}

export function usePublicServices(slug: string, enabled: boolean) {
  return useQuery<PublicService[]>({
    queryKey: publicServicesKey(slug),
    queryFn: () => listPublicServices(slug),
    enabled: !!slug && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicProfessionals(slug: string, enabled: boolean) {
  return useQuery<PublicProfessional[]>({
    queryKey: publicProfessionalsKey(slug),
    queryFn: () => listPublicProfessionals(slug),
    enabled: !!slug && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
