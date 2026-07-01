import { useMemo } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { deriveClients, type DerivedClient } from "@/lib/derive-clients";

export function useDerivedClients(): DerivedClient[] {
  const appointments = useAppointments();
  return useMemo(() => deriveClients(appointments), [appointments]);
}
