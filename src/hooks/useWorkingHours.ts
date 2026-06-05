import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import type { WorkingHour } from "@/lib/data-source/types";

export function useWorkingHoursQuery(professionalId?: string) {
  const { session, loading } = useSession();
  const userId = session?.user?.id;
  const sessionReady = IS_SUPABASE ? !loading && !!userId : true;
  const baseKey = qk.workingHours(professionalId);
  return useQuery({
    queryKey: IS_SUPABASE ? ([...baseKey, userId ?? "anon"] as const) : baseKey,
    queryFn: () => dataSource.listWorkingHours(professionalId),
    initialData: [] as WorkingHour[],
    enabled: !!professionalId && sessionReady,
  });
}
