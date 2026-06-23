import { publicRpc } from "./rpc";

export interface PublicService {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

type Row = {
  id?: string;
  service_id?: string;
  name?: string | null;
  duration_min?: number | null;
  duration_minutes?: number | null;
  price_cents?: number | null;
};

function adapt(row: Row): PublicService | null {
  const id =
    (typeof row.id === "string" && row.id) ||
    (typeof row.service_id === "string" && row.service_id) ||
    "";
  if (!id) return null;
  return {
    id,
    name: row.name ?? "",
    durationMinutes: row.duration_min ?? row.duration_minutes ?? 0,
    priceCents: row.price_cents ?? 0,
  };
}

export async function listPublicServices(tenantSlug: string): Promise<PublicService[]> {
  const data = await publicRpc<Row[] | null>("scheduling", "public_list_services", {
    p_tenant_slug: tenantSlug,
  });
  const rows = Array.isArray(data) ? data : [];
  return rows.map(adapt).filter((s): s is PublicService => s !== null);
}
