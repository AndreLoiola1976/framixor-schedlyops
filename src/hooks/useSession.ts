import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { IS_SUPABASE } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { resetTenantCache } from "@/lib/data-source";

interface SessionState {
  loading: boolean;
  session: Session | null;
}

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

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, session });
      resetTenantCache();
      queryClient.invalidateQueries();
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
