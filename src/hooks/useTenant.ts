import { activeTenant } from "@/config/tenant";

export function useTenant() {
  return activeTenant;
}
