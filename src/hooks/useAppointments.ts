import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { IS_SUPABASE } from "@/lib/env";
import { qk } from "@/lib/query-keys";
import { useSession } from "@/hooks/useSession";
import type { Appointment } from "@/types/appointment";

export function useAppointmentsQuery() {
  const { session, loading } = useSession();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: IS_SUPABASE ? [...qk.bookings, userId ?? "anon"] : qk.bookings,
    queryFn: () => dataSource.listBookings(),
    enabled: IS_SUPABASE ? !loading && !!userId : true,
    initialData: [] as Appointment[],
  });
}

export function useAppointments(): Appointment[] {
  return useAppointmentsQuery().data;
}
