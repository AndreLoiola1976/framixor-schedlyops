import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPublicBooking, type CreateBookingInput } from "@/lib/booking-public";
import { qk } from "@/lib/query-keys";

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => createPublicBooking(input),
    onSuccess: () => {
      // Refresh operator bookings list and any open slot queries so the
      // just-booked slot disappears on the next fetch.
      qc.invalidateQueries({ queryKey: qk.bookings });
      qc.invalidateQueries({ queryKey: ["available-slots"] });
      qc.invalidateQueries({ queryKey: qk.dashboardMetrics });
    },
    onSettled: () => {
      // Also refetch slots after a failure (e.g. slot_taken) so the dropdown
      // updates without the user having to change date/pro/service.
      qc.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
