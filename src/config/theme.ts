import type { Branding } from "@/types/branding";

/**
 * Default branding — values mirror the `:root` tokens in `src/styles.css`
 * so the rendered design is visually identical until a tenant overrides them.
 */
export const defaultBranding: Branding = {
  name: "SchedlyOps",
  logoInitials: "SO",
  primary: "oklch(0.21 0.04 265)",
  secondary: "oklch(0.965 0.008 250)",
  background: "oklch(0.99 0.003 250)",
  foreground: "oklch(0.18 0.02 260)",
};
