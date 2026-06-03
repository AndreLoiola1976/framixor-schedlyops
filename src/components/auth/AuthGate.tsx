import type { ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { IS_SUPABASE } from "@/lib/env";
import { useSession } from "@/hooks/useSession";

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, session } = useSession();
  const location = useLocation();

  if (!IS_SUPABASE) return <>{children}</>;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!session) {
    if (location.pathname === "/auth") return <>{children}</>;
    return <Navigate to="/auth" replace />;
  }
  if (location.pathname === "/auth") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
