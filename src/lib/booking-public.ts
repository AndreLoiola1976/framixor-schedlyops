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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const mapped = rows
    .map(extractSlotStart)
    .filter((v): v is string => typeof v === "string");
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

  // eslint-disable-next-line no-console
  console.log("[SCHEDLYOPS_BOOKING_RPC_RAW]", lastAvailableSlotsDebug);

  if (error) throw new Error(error.message);
  return mapped;
}

export interface CreateBookingInput {
  tenantSlug: string;
  professionalId: string;
  serviceId: string;
  /** ISO timestamptz — must be one of the slot_start values returned by public_available_slots. */
  startsAt: string;
  customerName: string;
  customerPhone: string;
}

/** Sentinel error so the dialog can map to the required user-facing copy. */
export class SlotTakenError extends Error {
  constructor(message = "slot_taken") {
    super(message);
    this.name = "SlotTakenError";
  }
}

const TAKEN_PATTERNS = [
  /slot/i,
  /conflict/i,
  /overlap/i,
  /already\s*booked/i,
  /not\s*available/i,
  /no_longer/i,
  /unavailable/i,
  /taken/i,
];

export async function createPublicBooking(input: CreateBookingInput): Promise<string> {
  const { data, error } = await rpc<string>("public_create_booking", {
    p_tenant_slug: input.tenantSlug,
    p_professional_id: input.professionalId,
    p_service_id: input.serviceId,
    p_starts_at: input.startsAt,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
  });
  if (error) {
    if (TAKEN_PATTERNS.some((re) => re.test(error.message))) {
      throw new SlotTakenError(error.message);
    }
    throw new Error(error.message);
  }
  return typeof data === "string" ? data : "";
}
