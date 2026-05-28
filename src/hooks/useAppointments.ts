import { appointments } from "@/config/appointments";
import { useTenant } from "./useTenant";

export function useAppointments() {
  const tenant = useTenant();
  return appointments
    .filter((a) => a.tenantId === tenant.id)
    .slice()
    .sort((a, b) => a.startISO.localeCompare(b.startISO));
}
