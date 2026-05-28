import { useTenant } from "./useTenant";
import { defaultBranding } from "@/config/theme";
import type { Branding } from "@/types/branding";

export function useBranding(): Branding {
  const tenant = useTenant();
  return tenant.branding ?? defaultBranding;
}
