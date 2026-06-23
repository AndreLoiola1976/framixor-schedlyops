import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Supabase client BEFORE importing the module under test.
type InvokeArgs = { body: Record<string, unknown> };
type InvokeResult = { data: unknown; error: unknown };

const invokeMock = vi.fn<(name: string, opts: InvokeArgs) => Promise<InvokeResult>>();

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    functions: { invoke: invokeMock },
    schema: () => ({ rpc: () => Promise.resolve({ data: null, error: null }) }),
  }),
}));

import { createPublicBooking, SlotTakenError, BookingWrapperError } from "@/lib/booking-public";

const baseInput = {
  tenantSlug: "demo-barber",
  professionalId: "pro-1",
  serviceId: "svc-1",
  startsAt: "2030-01-01T10:00:00.000Z",
  customerName: "Alice",
  customerPhone: "+5511999999999",
  idempotencyKey: "00000000-0000-4000-8000-000000000001",
};

beforeEach(() => {
  invokeMock.mockReset();
});

function makeHttpError(code: string, status = 400): unknown {
  return {
    name: "FunctionsHttpError",
    message: `Edge Function returned ${status}`,
    context: {
      status,
      json: async () => ({ code }),
    },
  };
}

describe("createPublicBooking wrapper", () => {
  it("calls public-create-booking with the documented body and returns success", async () => {
    invokeMock.mockResolvedValue({
      data: { booking_id: "b-1", manage_token: "tok-1" },
      error: null,
    });

    const res = await createPublicBooking(baseInput);

    expect(invokeMock).toHaveBeenCalledTimes(1);
    const [name, opts] = invokeMock.mock.calls[0];
    expect(name).toBe("public-create-booking");
    expect(opts.body).toEqual({
      tenant_slug: "demo-barber",
      professional_id: "pro-1",
      service_id: "svc-1",
      starts_at: "2030-01-01T10:00:00.000Z",
      customer_name: "Alice",
      customer_phone: "+5511999999999",
      idempotency_key: "00000000-0000-4000-8000-000000000001",
    });
    expect(res).toEqual({ bookingId: "b-1", manageToken: "tok-1", duplicate: false });
  });

  it("flags explicit duplicate replay as duplicate=true", async () => {
    invokeMock.mockResolvedValue({
      data: { booking_id: "b-1", duplicate: true },
      error: null,
    });
    const res = await createPublicBooking(baseInput);
    expect(res).toEqual({ bookingId: "b-1", manageToken: null, duplicate: true });
  });

  it("treats booking_id without manage_token as a duplicate replay", async () => {
    invokeMock.mockResolvedValue({ data: { booking_id: "b-1" }, error: null });
    const res = await createPublicBooking(baseInput);
    expect(res.duplicate).toBe(true);
    expect(res.manageToken).toBeNull();
    expect(res.bookingId).toBe("b-1");
  });

  it("throws SlotTakenError for slot_taken", async () => {
    invokeMock.mockResolvedValue({ data: null, error: makeHttpError("slot_taken", 409) });
    await expect(createPublicBooking(baseInput)).rejects.toBeInstanceOf(SlotTakenError);
  });

  const mapped = [
    "invalid_input",
    "tenant_not_found",
    "rate_limited",
    "outside_hours",
    "slot_in_past",
    "invalid_service",
    "invalid_professional",
  ];
  for (const code of mapped) {
    it(`throws BookingWrapperError(${code}) for ${code}`, async () => {
      invokeMock.mockResolvedValue({ data: null, error: makeHttpError(code) });
      try {
        await createPublicBooking(baseInput);
        throw new Error("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(BookingWrapperError);
        expect((e as BookingWrapperError).code).toBe(code);
      }
    });
  }

  it("throws synchronously when tenantSlug is missing", async () => {
    await expect(
      createPublicBooking({ ...baseInput, tenantSlug: undefined } as never),
    ).rejects.toThrow(/tenantSlug/);
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("throws synchronously when idempotencyKey is missing", async () => {
    await expect(
      createPublicBooking({ ...baseInput, idempotencyKey: undefined } as never),
    ).rejects.toThrow(/idempotencyKey/);
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("falls back to message parsing when context.json is unavailable", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: { name: "FunctionsHttpError", message: "rate_limited" },
    });
    try {
      await createPublicBooking(baseInput);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(BookingWrapperError);
      expect((e as BookingWrapperError).code).toBe("rate_limited");
    }
  });
});

describe("useCreateBooking idempotency key behavior", () => {
  it("reuses the same key across retries of identical inputs and mints a new one on input change", async () => {
    // Pure-function test via the hook's exported helpers: validate the
    // fingerprint stability rule that drives the ref's reuse/reset logic.
    const { _fingerprintForTests, _mintForTests } = await import("@/hooks/useCreateBooking");
    const inputA = { ...baseInput };
    const inputB = { ...baseInput, customerName: "Bob" };

    expect(_fingerprintForTests(inputA)).toBe(_fingerprintForTests({ ...inputA }));
    expect(_fingerprintForTests(inputA)).not.toBe(_fingerprintForTests(inputB));

    const k1 = _mintForTests();
    const k2 = _mintForTests();
    expect(k1).not.toBe(k2);
    expect(k1.length).toBeGreaterThan(8);
  });
});
