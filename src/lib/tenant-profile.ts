import { getSupabase } from "@/lib/supabase";

/**
 * Tenant profile RPCs (core schema, confirmed backend contract).
 *
 * - core.operator_get_tenant_profile()  → TABLE-returning, read data[0]
 * - core.operator_update_tenant_profile(p_*) → named args; null/undefined = leave unchanged
 *
 * Confirmed accepted parameter names (verified via PostgREST OpenAPI probe —
 * superset returned permission_denied, not function-not-found):
 *   p_display_name, p_tagline, p_description,
 *   p_public_phone, p_public_email,
 *   p_website_url, p_logo_url,
 *   p_address_line1, p_address_line2, p_city, p_state, p_postal_code, p_country_code
 *
 * Currency is NOT part of this contract — it lives in tenant_settings.
 * tenants.name is NOT updated here — display_name is the public branding field.
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

export interface TenantProfile {
  display_name: string | null;
  tagline: string | null;
  description: string | null;
  public_phone: string | null;
  public_email: string | null;
  website_url: string | null;
  logo_url: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;
  /** Raw row for diagnostics / future fields. */
  raw: Record<string, unknown>;
}

export type TenantProfilePatch = Partial<Omit<TenantProfile, "raw">>;

function str(r: Record<string, unknown>, k: string): string | null {
  return typeof r[k] === "string" ? (r[k] as string) : null;
}

function parseProfile(data: unknown): TenantProfile | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return {
    display_name: str(r, "display_name"),
    tagline: str(r, "tagline"),
    description: str(r, "description"),
    public_phone: str(r, "public_phone"),
    public_email: str(r, "public_email"),
    website_url: str(r, "website_url"),
    logo_url: str(r, "logo_url"),
    address_line1: str(r, "address_line1"),
    address_line2: str(r, "address_line2"),
    city: str(r, "city"),
    state: str(r, "state"),
    postal_code: str(r, "postal_code"),
    country_code: str(r, "country_code"),
    raw: r,
  };
}

function logRaw(tag: string, params: Record<string, unknown>, data: unknown, error: unknown) {
  console.log(`[SCHEDLYOPS_RPC_RAW] ${tag}`, {
    params,
    data,
    error,
    firstRow: Array.isArray(data) ? (data[0] ?? null) : data,
  });
}

export async function getTenantProfile(): Promise<TenantProfile | null> {
  const { data, error } = await rpc<unknown>("operator_get_tenant_profile");
  logRaw("core.operator_get_tenant_profile", {}, data, error);
  if (error) throw new Error(error.message);
  return parseProfile(data);
}

export async function updateTenantProfile(
  patch: TenantProfilePatch,
): Promise<TenantProfile | null> {
  const args: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) args[`p_${k}`] = v;
  }
  const { data, error } = await rpc<unknown>("operator_update_tenant_profile", args);
  logRaw("core.operator_update_tenant_profile", args, data, error);
  if (error) throw new Error(error.message);
  return parseProfile(data);
}
