import { publicRpc } from "./rpc";

export interface PublicProfessional {
  id: string;
  name: string;
}

type Row = {
  id?: string;
  professional_id?: string;
  name?: string | null;
  display_name?: string | null;
};

function adapt(row: Row): PublicProfessional | null {
  const id = (typeof row.id === "string" && row.id) ||
    (typeof row.professional_id === "string" && row.professional_id) || "";
  if (!id) return null;
  const name = row.display_name?.trim() || row.name?.trim() || "Professional";
  return { id, name };
}

export async function listPublicProfessionals(tenantSlug: string): Promise<PublicProfessional[]> {
  const data = await publicRpc<Row[] | null>("scheduling", "public_list_professionals", {
    p_tenant_slug: tenantSlug,
  });
  const rows = Array.isArray(data) ? data : [];
  return rows.map(adapt).filter((p): p is PublicProfessional => p !== null);
}
