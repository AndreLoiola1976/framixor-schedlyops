import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";
import type { Service } from "@/types/service";

export function useServicesQuery() {
  return useQuery({
    queryKey: qk.services,
    queryFn: () => dataSource.listServices(),
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
