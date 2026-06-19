import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useBranding } from "@/hooks/useBranding";
import { DEFAULT_THEME, THEME_STORAGE_KEY, ThemeContext, type ThemeMode } from "@/hooks/useTheme";
import type { Branding } from "@/types/branding";

/**
 * Inline CSS variables this provider manages for per-tenant branding overrides.
 * Cleanup only touches these — unrelated CSS variables on :root are left intact.
 *
 * IMPORTANT: tenant branding overrides are ONLY applied in `light` mode.
 * In `dark` and `demo-barber` modes the theme's own token set wins so brand
 * colors don't bleed through and break contrast on dark surfaces.
 */
const MANAGED_VARS = [
  "--primary",
  "--secondary",
  "--background",
  "--foreground",
  "--sidebar-primary",
  "--ring",
] as const;

const THEME_CLASSES: Record<ThemeMode, string | null> = {
  light: null,
  dark: "dark",
  "demo-barber": "theme-demo-barber",
};

function brandingToVars(b: Branding): Record<(typeof MANAGED_VARS)[number], string> {
  return {
    "--primary": b.primary,
    "--secondary": b.secondary,
    "--background": b.background,
    "--foreground": b.foreground,
    "--sidebar-primary": b.primary,
    "--ring": b.primary,
  };
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "demo-barber") return stored;
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Hydrate after mount to keep SSR markup stable (matches LocaleProvider).
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME);
  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
    }
  }, []);

  // Toggle theme mode class on <html>. Additive: never clobbers unrelated
  // classes that other code may have added.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    for (const cls of Object.values(THEME_CLASSES)) {
      if (cls) root.classList.remove(cls);
    }
    const next = THEME_CLASSES[theme];
    if (next) root.classList.add(next);
  }, [theme]);

  const branding = useBranding();
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme !== "light") {
      // Strip any previously set tenant overrides so the dark/demo tokens win.
      for (const name of MANAGED_VARS) root.style.removeProperty(name);
      return;
    }
    const vars = brandingToVars(branding);
    for (const name of MANAGED_VARS) {
      root.style.setProperty(name, vars[name]);
    }
    return () => {
      for (const name of MANAGED_VARS) {
        root.style.removeProperty(name);
      }
    };
  }, [branding, theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
