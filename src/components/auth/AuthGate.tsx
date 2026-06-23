import type { ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { IS_SUPABASE } from "@/lib/env";
import { useSession } from "@/hooks/useSession";

function isPublicPath(pathname: string): boolean {
  // Explicit allowlist. Never widen to a denylist — every new public route
  // must be added here on purpose.
  return pathname === "/auth" || pathname.startsWith("/book/");
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, session } = useSession();
  const location = useLocation();
  const publicPath = isPublicPath(location.pathname);

  if (!IS_SUPABASE) return <>{children}</>;
  // Public routes render immediately, signed-in or not. We never block the
  // unauthenticated booking page on a session check.
  if (publicPath) return <>{children}</>;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}
