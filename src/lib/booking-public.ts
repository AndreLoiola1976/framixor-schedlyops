import { getSupabase } from "@/lib/supabase";

/**
 * Thin wrappers over the documented public scheduling RPCs.
 *
 * These are the only call sites that talk to `public_*` RPCs from the
 * operator UI. The frontend does NOT compute availability or detect
 * conflicts — both responsibilities stay backend-owned.
 *
 * Contracts (confirmed by product, do not edit param names):
 *
 *   scheduling.public_available_slots({
 *     p_tenant_slug, p_professional_id, p_service_id, p_date
 *   }) -> [{ slot_start: string }]    // slot_start is ISO timestamptz
 *
 *   scheduling.public_create_booking({
 *     p_tenant_slug, p_professional_id, p_service_id, p_starts_at,
 *     p_customer_name, p_customer_phone
 *   }) -> string                       // booking uuid
 */

function rpc<T = unknown>(fn: string, args: Record<string, unknown>) {
  return (
    getSupabase()
      .schema("scheduling")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .rpc(fn as any, args as any) as unknown as Promise<{
      data: T | null;
      error: { message: string; code?: string } | null;
    }>
  );
}

export interface AvailableSlotsInput {
  tenantSlug: string;
  professionalId: string;
  serviceId: string;
  /** YYYY-MM-DD */
  date: string;
}

export interface AvailableSlotsDebug {
  params: Record<string, unknown>;
  rawData: unknown;
  rawError: { message: string; code?: string } | null;
  mapped: string[];
  rawDataType: string;
  rawDataLength: number;
  firstRow: unknown;
  firstRowKeys: string[] | null;
}

let lastAvailableSlotsDebug: AvailableSlotsDebug | null = null;

export function getLastAvailableSlotsDebug(): AvailableSlotsDebug | null {
  return lastAvailableSlotsDebug;
}

function extractSlotStart(row: unknown): string | null {
  if (typeof row === "string") return row;
  if (!row || typeof row !== "object") return null;

  const record = row as Record<string, unknown>;
  const value =
    record.slot_start ?? record.start ?? record.starts_at ?? record.public_available_slots;

  return typeof value === "string" ? value : null;
}

export async function listAvailableSlots(input: AvailableSlotsInput): Promise<string[]> {
  const params = {
    p_tenant_slug: input.tenantSlug,
    p_professional_id: input.professionalId,
    p_service_id: input.serviceId,
    p_date: input.date,
  };
  const { data, error } = await rpc<unknown>("public_available_slots", params);
  const rows = Array.isArray(data) ? data : data == null ? [] : [data];
  const mapped = rows.map(extractSlotStart).filter((v): v is string => typeof v === "string");
  const firstRow = rows[0] ?? null;
  const firstRowKeys =
    firstRow && typeof firstRow === "object" && !Array.isArray(firstRow)
      ? Object.keys(firstRow as Record<string, unknown>)
      : null;
  const rawDataType = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
  const rawDataLength = Array.isArray(data) ? data.length : data == null ? 0 : 1;

  lastAvailableSlotsDebug = {
    params,
    rawData: data,
    rawError: error,
    mapped,
    rawDataType,
    rawDataLength,
    firstRow,
    firstRowKeys,
  };

  console.log("[SCHEDLYOPS_BOOKING_RPC_RAW]", lastAvailableSlotsDebug);

  if (error) throw new Error(error.message);
  return mapped;
}

export interface CreateBookingInput {
  /** Required only for public_create_booking. Omit for operator_create_booking (tenant from JWT). */
  tenantSlug?: string;
  professionalId: string;
  serviceId: string;
  /** ISO timestamptz — must be one of the slot_start values returned by public_available_slots. */
  startsAt: string;
  customerName: string;
  customerPhone: string;
}

/** Shape returned by operator_create_booking / public_create_booking after migration 0023. */
export interface CreateBookingResult {
  bookingId: string;
  /** Single-use customer manage token. Only returned at creation time — never refetched later. */
  manageToken: string | null;
}

/** Sentinel error so the dialog can map to the required user-facing copy. */
export class SlotTakenError extends Error {
  constructor(message = "slot_taken") {
    super(message);
    this.name = "SlotTakenError";
  }
}

const TAKEN_PATTERNS = [
  /slot_taken/i,
  /conflict/i,
  /overlap/i,
  /already\s*booked/i,
  /not\s*available/i,
  /no_longer/i,
  /unavailable/i,
  /\btaken\b/i,
];

/**
 * Parse the booking response. TABLE-returning RPC returns
 * [{booking_id, manage_token}] (migration 0023). Tolerates legacy scalar uuid.
 */
function parseBookingResponse(data: unknown): CreateBookingResult {
  if (typeof data === "string") return { bookingId: data, manageToken: null };
  const row = Array.isArray(data) ? data[0] : data;
  if (row && typeof row === "object") {
    const rec = row as Record<string, unknown>;
    const bookingId =
      (typeof rec.booking_id === "string" && rec.booking_id) ||
      (typeof rec.id === "string" && rec.id) ||
      "";
    const manageToken =
      (typeof rec.manage_token === "string" && rec.manage_token) ||
      (typeof rec.token === "string" && rec.token) ||
      null;
    return { bookingId, manageToken };
  }
  return { bookingId: "", manageToken: null };
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function throwBookingError(error: { message: string }): never {
  if (TAKEN_PATTERNS.some((re) => re.test(error.message))) {
    throw new SlotTakenError(error.message);
  }
  throw new Error(error.message);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logRaw(tag: string, params: Record<string, unknown>, data: unknown, error: any) {
  console.log(`[SCHEDLYOPS_RPC_RAW] ${tag}`, {
    params,
    data,
    error,
    dataType: Array.isArray(data) ? "array" : data === null ? "null" : typeof data,
    dataLength: Array.isArray(data) ? data.length : data == null ? 0 : 1,
    firstRow: Array.isArray(data) ? (data[0] ?? null) : data,
    firstRowKeys:
      data && typeof (Array.isArray(data) ? data[0] : data) === "object"
        ? Object.keys((Array.isArray(data) ? data[0] : data) as Record<string, unknown>)
        : null,
  });
}

/** Public (anonymous) booking — used by /b/{token} flow and anonymous booking widget. */
export async function createPublicBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  if (!input.tenantSlug) throw new Error("tenantSlug is required for public_create_booking");
  const params = {
    p_tenant_slug: input.tenantSlug,
    p_professional_id: input.professionalId,
    p_service_id: input.serviceId,
    p_starts_at: input.startsAt,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
  };
  const { data, error } = await rpc<unknown>("public_create_booking", params);
  logRaw("scheduling.public_create_booking", params, data, error);
  if (error) throwBookingError(error);
  return parseBookingResponse(data);
}

/** Operator-side booking. Tenant context comes from the JWT — do NOT pass tenant slug. */
export async function createOperatorBooking(
  input: Omit<CreateBookingInput, "tenantSlug">,
): Promise<CreateBookingResult> {
  const params = {
    p_professional_id: input.professionalId,
    p_service_id: input.serviceId,
    p_starts_at: input.startsAt,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
  };
  const { data, error } = await rpc<unknown>("operator_create_booking", params);
  logRaw("scheduling.operator_create_booking", params, data, error);
  if (error) throwBookingError(error);
  return parseBookingResponse(data);
}

// -------- Operator booking lifecycle (migration 0023) --------

export async function operatorCancelBooking(bookingId: string): Promise<void> {
  const params = { p_booking_id: bookingId };
  const { data, error } = await rpc("operator_cancel_booking", params);
  logRaw("scheduling.operator_cancel_booking", params, data, error);
  throwIfError(error);
}

export async function operatorCompleteBooking(bookingId: string): Promise<void> {
  const params = { p_booking_id: bookingId };
  const { data, error } = await rpc("operator_complete_booking", params);
  logRaw("scheduling.operator_complete_booking", params, data, error);
  throwIfError(error);
}

export async function operatorMarkNoShow(bookingId: string): Promise<void> {
  const params = { p_booking_id: bookingId };
  const { data, error } = await rpc("operator_mark_no_show", params);
  logRaw("scheduling.operator_mark_no_show", params, data, error);
  throwIfError(error);
}

export async function operatorRescheduleBooking(input: {
  bookingId: string;
  /** ISO timestamptz from public_available_slots */
  newStartsAt: string;
}): Promise<void> {
  const params = { p_booking_id: input.bookingId, p_starts_at: input.newStartsAt };
  const { data, error } = await rpc("operator_reschedule_booking", params);
  logRaw("scheduling.operator_reschedule_booking", params, data, error);
  if (error) throwBookingError(error);
}

export async function operatorUpdateBooking(input: {
  bookingId: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
}): Promise<void> {
  const args: Record<string, unknown> = { p_booking_id: input.bookingId };
  if (input.customerName !== undefined) args.p_customer_name = input.customerName;
  if (input.customerPhone !== undefined) args.p_customer_phone = input.customerPhone;
  if (input.note !== undefined) args.p_note = input.note;
  const { data, error } = await rpc("operator_update_booking", args);
  logRaw("scheduling.operator_update_booking", args, data, error);
  throwIfError(error);
}
