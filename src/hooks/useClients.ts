import { clients } from "@/config/clients";
import { useTenant } from "./useTenant";

export function useClients() {
  const tenant = useTenant();
  return clients.filter((c) => c.tenantId === tenant.id);
}

export function useClientMap() {
  const list = useClients();
  return Object.fromEntries(list.map((c) => [c.id, c]));
}
