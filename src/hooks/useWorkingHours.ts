import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";
import type { WorkingHour } from "@/lib/data-source/types";

export function useWorkingHoursQuery(professionalId?: string) {
  return useQuery({
    queryKey: qk.workingHours(professionalId),
    queryFn: () => dataSource.listWorkingHours(professionalId),
    initialData: [] as WorkingHour[],
    enabled: !!professionalId,
  });
}
