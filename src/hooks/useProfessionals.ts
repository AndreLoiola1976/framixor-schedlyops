import { professionals } from "@/config/professionals";
import { useTenant } from "./useTenant";

export function useProfessionals() {
  const tenant = useTenant();
  return professionals.filter((p) => p.tenantId === tenant.id);
}

export function useProfessionalMap() {
  const list = useProfessionals();
  return Object.fromEntries(list.map((p) => [p.id, p]));
}
