import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import type { Service } from "@/types/service";

export function useServicesQuery() {
  const { session, loading } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: IS_SUPABASE ? [...qk.services, userId ?? "anon"] : qk.services,
    queryFn: () => dataSource.listServices(),
    enabled: IS_SUPABASE ? !loading && !!userId : true,
    initialData: [] as Service[],
  });
}

export function useServices(): Service[] {
  return useServicesQuery().data;
}

export function useServiceMap(): Record<string, Service> {
  const list = useServices();
  return Object.fromEntries(list.map((s) => [s.id, s]));
}
