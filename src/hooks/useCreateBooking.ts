import { useRef } from "react";
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
 * - If `tenantSlug` is provided (anonymous/public surface), uses the
 *   `public-create-booking` Edge Function wrapper.
 * - Otherwise (operator UI), uses `operator_create_booking` — tenant comes from JWT.
 *
 * Returns `{bookingId, manageToken, duplicate}`. `manage_token` is only
 * returned at creation and must never be refetched later. `duplicate` is
 * true when the wrapper recognised the attempt as an idempotent replay.
 *
 * Idempotency key handling (public path only):
 * - One UUID v4 is minted per submission attempt.
 * - It stays stable across retries of the same attempt (same input fields).
 * - It resets when the user changes any input or after a successful submit,
 *   so the next distinct attempt gets a fresh key.
 */
function fingerprint(input: CreateBookingInput): string {
  return JSON.stringify({
    tenantSlug: input.tenantSlug ?? null,
    professionalId: input.professionalId,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
  });
}

function mintIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (older runtimes). Not cryptographically strong but acceptable
  // as a last-resort dedupe token; production browsers always have randomUUID.
  return "k-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

export function useCreateBooking() {
  const qc = useQueryClient();
  const attemptRef = useRef<{ fingerprint: string; key: string } | null>(null);

  function resolveIdempotencyKey(input: CreateBookingInput): string {
    if (input.idempotencyKey) return input.idempotencyKey;
    const fp = fingerprint(input);
    const prev = attemptRef.current;
    if (prev && prev.fingerprint === fp) return prev.key;
    const key = mintIdempotencyKey();
    attemptRef.current = { fingerprint: fp, key };
    return key;
  }

  return useMutation<CreateBookingResult, Error, CreateBookingInput>({
    mutationFn: (input) => {
      if (input.tenantSlug) {
        const idempotencyKey = resolveIdempotencyKey(input);
        return createPublicBooking({ ...input, idempotencyKey });
      }
      return createOperatorBooking(input);
    },
    onSuccess: () => {
      // Successful submission — next attempt should get a fresh idempotency key.
      attemptRef.current = null;
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

// Re-export for tests / public consumers that build their own mutation wrapper.
export { fingerprint as _fingerprintForTests, mintIdempotencyKey as _mintForTests };
