import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";
import type { Appointment } from "@/types/appointment";

export function useAppointmentsQuery() {
  return useQuery({
    queryKey: qk.bookings,
    queryFn: () => dataSource.listBookings(),
    initialData: [] as Appointment[],
  });
}

export function useAppointments(): Appointment[] {
  return useAppointmentsQuery().data;
}
