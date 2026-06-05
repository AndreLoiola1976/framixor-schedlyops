import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import type { Professional } from "@/types/professional";

export function useProfessionalsQuery() {
  const { session, loading } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: IS_SUPABASE ? [...qk.professionals, userId ?? "anon"] : qk.professionals,
    queryFn: () => dataSource.listProfessionals(),
    enabled: IS_SUPABASE ? !loading && !!userId : true,
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
