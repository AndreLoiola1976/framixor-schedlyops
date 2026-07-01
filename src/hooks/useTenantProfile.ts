import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import { toUserMessage } from "@/lib/scheduling-errors";
import {
  getTenantProfile,
  updateTenantProfile,
  type TenantProfile,
  type TenantProfilePatch,
} from "@/lib/tenant-profile";

export const qkTenantProfile = ["tenant-profile"] as const;

export function useTenantProfile() {
  const { session, loading } = useSession();
  return useQuery<TenantProfile | null>({
    queryKey: qkTenantProfile,
    queryFn: () => getTenantProfile(),
    enabled: IS_SUPABASE && !loading && !!session?.user?.id,
    staleTime: 30_000,
  });
}

export function useUpdateTenantProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: TenantProfilePatch) => updateTenantProfile(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qkTenantProfile });
      qc.invalidateQueries({ queryKey: qk.tenant });
      toast.success("Profile saved");
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });
}
