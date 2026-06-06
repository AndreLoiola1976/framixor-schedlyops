import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOperatorBooking,
  createPublicBooking,
  type CreateBookingInput,
  type CreateBookingResult,
} from "@/lib/booking-public";
import { qk } from "@/lib/query-keys";

/**
 * Default booking-create hook used by the operator dialog.
 * - If `tenantSlug` is provided (anonymous/public surface), uses public_create_booking.
 * - Otherwise (operator UI), uses operator_create_booking — tenant comes from JWT.
 *
 * Returns `{bookingId, manageToken}`. manage_token is only returned at creation
 * and must never be refetched later.
 */
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation<CreateBookingResult, Error, CreateBookingInput>({
    mutationFn: (input) =>
      input.tenantSlug ? createPublicBooking(input) : createOperatorBooking(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.bookings });
      qc.invalidateQueries({ queryKey: ["available-slots"] });
      qc.invalidateQueries({ queryKey: qk.dashboardMetrics });
    },
    onSettled: () => {
      // Refetch slots after failure too (e.g. slot_taken) so the dropdown updates.
      qc.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
