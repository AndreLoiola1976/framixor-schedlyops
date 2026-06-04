import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { IS_SUPABASE } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { resetTenantCache } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";

interface SessionState {
  loading: boolean;
  session: Session | null;
}

const APP_KEYS = [
  qk.tenant,
  qk.services,
  qk.professionals,
  qk.workingHours(),
  qk.bookings,
  qk.clients,
  qk.dashboardMetrics,
] as const;

/**
 * Subscribes to Supabase auth state. In mock mode returns a stable signed-in
 * stub so guarded routes keep working without a real backend.
 */
export function useSession(): SessionState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>(() =>
    IS_SUPABASE ? { loading: true, session: null } : { loading: false, session: null },
  );

  useEffect(() => {
    if (!IS_SUPABASE) return;
    const supabase = getSupabase();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({ loading: false, session: data.session });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED"
      ) {
        // Ignore TOKEN_REFRESHED / INITIAL_SESSION churn.
        setState({ loading: false, session });
        return;
      }
      setState({ loading: false, session });
      resetTenantCache();

      if (event === "SIGNED_OUT") {
        // Targeted removal — avoid clearing unrelated provider state and
        // avoid refetching protected queries with no bearer (401 storms).
        for (const key of APP_KEYS) {
          queryClient.removeQueries({ queryKey: key });
        }
      } else {
        // SIGNED_IN / USER_UPDATED: invalidate so active subscribers refetch
        // with the new identity.
        for (const key of APP_KEYS) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  return state;
}

export async function signOut(): Promise<void> {
  if (!IS_SUPABASE) return;
  await getSupabase().auth.signOut();
}
