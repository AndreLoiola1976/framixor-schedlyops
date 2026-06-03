import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";
import type { Professional } from "@/types/professional";

export function useProfessionalsQuery() {
  return useQuery({
    queryKey: qk.professionals,
    queryFn: () => dataSource.listProfessionals(),
    initialData: [] as Professional[],
  });
}

export function useProfessionals(): Professional[] {
  return useProfessionalsQuery().data;
}

export function useProfessionalMap(): Record<string, Professional> {
  const list = useProfessionals();
  return Object.fromEntries(list.map((p) => [p.id, p]));
}
