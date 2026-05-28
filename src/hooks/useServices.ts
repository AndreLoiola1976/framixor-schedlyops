import { services } from "@/config/services";
import { useTenant } from "./useTenant";

export function useServices() {
  const tenant = useTenant();
  return services.filter((s) => s.tenantId === tenant.id);
}

export function useServiceMap() {
  const list = useServices();
  return Object.fromEntries(list.map((s) => [s.id, s]));
}
