import { useEffect, type ReactNode } from "react";
import { useBranding } from "@/hooks/useBranding";
import type { Branding } from "@/types/branding";

/**
 * Inline CSS variables this provider manages. Cleanup only touches these —
 * unrelated CSS variables on :root are left intact.
 */
const MANAGED_VARS = [
  "--primary",
  "--secondary",
  "--background",
  "--foreground",
  "--sidebar-primary",
  "--ring",
] as const;

function brandingToVars(b: Branding): Record<(typeof MANAGED_VARS)[number], string> {
  return {
    "--primary": b.primary,
    "--secondary": b.secondary,
    "--background": b.background,
    "--foreground": b.foreground,
    // Sidebar primary mirrors primary so the sidebar accent stays in brand.
    "--sidebar-primary": b.primary,
    // Focus ring mirrors primary for brand-consistent focus states.
    "--ring": b.primary,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const branding = useBranding();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const vars = brandingToVars(branding);
    for (const name of MANAGED_VARS) {
      root.style.setProperty(name, vars[name]);
    }
    return () => {
      for (const name of MANAGED_VARS) {
        root.style.removeProperty(name);
      }
    };
  }, [branding]);

  return <>{children}</>;
}
