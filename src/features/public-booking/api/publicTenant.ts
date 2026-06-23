import { publicRpc } from "./rpc";

export interface PublicTenantProfile {
  tenantId: string;
  slug: string;
  displayName: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  timezone: string | null;
  countryCode: string | null;
}

type Row = {
  tenant_id?: string;
  id?: string;
  slug?: string;
  display_name?: string | null;
  name?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  public_email?: string | null;
  public_phone?: string | null;
  timezone?: string | null;
  country_code?: string | null;
};

function adapt(row: Row | null | undefined, slug: string): PublicTenantProfile | null {
  if (!row) return null;
  const tenantId =
    (typeof row.tenant_id === "string" && row.tenant_id) ||
    (typeof row.id === "string" && row.id) ||
    "";
  if (!tenantId) return null;
  const display = row.display_name?.trim() || row.name?.trim() || "Workspace";
  return {
    tenantId,
    slug: row.slug ?? slug,
    displayName: display,
    tagline: row.tagline ?? null,
    description: row.description ?? null,
    logoUrl: row.logo_url ?? null,
    websiteUrl: row.website_url ?? null,
    publicEmail: row.public_email ?? null,
    publicPhone: row.public_phone ?? null,
    timezone: row.timezone ?? null,
    countryCode: row.country_code ?? null,
  };
}

/**
 * core.public_get_tenant_profile(p_slug) — TABLE-returning RPC; take [0] ?? null.
 * Returns null when the slug doesn't resolve to a public tenant.
 */
export async function getPublicTenantProfile(slug: string): Promise<PublicTenantProfile | null> {
  const data = await publicRpc<Row[] | Row | null>("core", "public_get_tenant_profile", {
    p_slug: slug,
  });
  const row = Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
  return adapt(row, slug);
}
