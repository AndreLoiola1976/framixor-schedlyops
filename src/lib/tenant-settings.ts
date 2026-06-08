import { getSupabase } from "@/lib/supabase";

/**
 * Tenant settings RPCs (migration 0023). Schema selector: core.
 * - operator_get_tenant_settings: TABLE-returning, read data[0]
 * - operator_update_tenant_settings: named p_* args; null/undefined = leave unchanged
 *
 * Field names mirror the documented backend contract. UI never invents defaults —
 * the form always seeds from the backend response.
 */

function rpc<T = unknown>(fn: string, args?: Record<string, unknown>) {
  return (
    getSupabase()
      .schema("core")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .rpc(fn as any, args as any) as unknown as Promise<{
      data: T | null;
      error: { message: string } | null;
    }>
  );
}

export interface TenantSettings {
  slug: string | null;
  name: string | null;
  timezone: string | null;
  default_locale: string | null;
  country_code: string | null;
  self_reschedule_cutoff_minutes: number | null;
  allow_customer_self_cancel: boolean | null;
  allow_customer_self_reschedule: boolean | null;
  late_cancel_fee_percent: number | null;
  no_show_fee_percent: number | null;
  payment_required_for_booking: boolean | null;
  cancellation_fee_policy_enabled: boolean | null;
  /** Raw row for diagnostics. */
  raw: Record<string, unknown>;
}

export type TenantSettingsPatch = Partial<Omit<TenantSettings, "slug" | "name" | "raw">>;

function parseSettings(data: unknown): TenantSettings | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : null);
  const num = (k: string) => (typeof r[k] === "number" ? (r[k] as number) : null);
  const bool = (k: string) => (typeof r[k] === "boolean" ? (r[k] as boolean) : null);
  return {
    slug: str("slug"),
    name: str("name"),
    timezone: str("timezone"),
    default_locale: str("default_locale"),
    country_code: str("country_code"),
    self_reschedule_cutoff_minutes: num("self_reschedule_cutoff_minutes"),
    allow_customer_self_cancel: bool("allow_customer_self_cancel"),
    allow_customer_self_reschedule: bool("allow_customer_self_reschedule"),
    late_cancel_fee_percent: num("late_cancel_fee_percent"),
    no_show_fee_percent: num("no_show_fee_percent"),
    payment_required_for_booking: bool("payment_required_for_booking"),
    cancellation_fee_policy_enabled: bool("cancellation_fee_policy_enabled"),
    raw: r,
  };
}

function logRawSettings(
  tag: string,
  params: Record<string, unknown>,
  data: unknown,
  error: unknown,
) {
  console.log(`[SCHEDLYOPS_RPC_RAW] ${tag}`, {
    params,
    data,
    error,
    dataType: Array.isArray(data) ? "array" : data === null ? "null" : typeof data,
    firstRow: Array.isArray(data) ? (data[0] ?? null) : data,
    firstRowKeys:
      data && typeof (Array.isArray(data) ? data[0] : data) === "object"
        ? Object.keys((Array.isArray(data) ? data[0] : data) as Record<string, unknown>)
        : null,
  });
}

export async function getTenantSettings(): Promise<TenantSettings | null> {
  const { data, error } = await rpc<unknown>("operator_get_tenant_settings");
  logRawSettings("core.operator_get_tenant_settings", {}, data, error);
  if (error) throw new Error(error.message);
  return parseSettings(data);
}

export async function updateTenantSettings(
  patch: TenantSettingsPatch,
): Promise<TenantSettings | null> {
  const args: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) args[`p_${k}`] = v;
  }
  const { data, error } = await rpc<unknown>("operator_update_tenant_settings", args);
  logRawSettings("core.operator_update_tenant_settings", args, data, error);
  if (error) throw new Error(error.message);
  return parseSettings(data);
}
