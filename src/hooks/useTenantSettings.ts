import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import { toUserMessage } from "@/lib/scheduling-errors";
import {
  getTenantSettings,
  updateTenantSettings,
  type TenantSettings,
  type TenantSettingsPatch,
} from "@/lib/tenant-settings";

export function useTenantSettings() {
  const { session, loading } = useSession();
  return useQuery<TenantSettings | null>({
    queryKey: qk.tenantSettings,
    queryFn: () => getTenantSettings(),
    enabled: IS_SUPABASE && !loading && !!session?.user?.id,
    staleTime: 30_000,
  });
}

export function useUpdateTenantSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: TenantSettingsPatch) => updateTenantSettings(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tenantSettings });
      qc.invalidateQueries({ queryKey: qk.tenant });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });
}
