/**
 * Runtime environment for SchedlyOps.
 *
 * Validated at module-load time. If VITE_DATA_SOURCE=supabase the Supabase URL
 * and anon key MUST be present — otherwise we throw synchronously instead of
 * silently degrading to mock data.
 */

export type DataSource = "mock" | "supabase";

function readString(name: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[name];
  return typeof raw === "string" ? raw.trim() : "";
}

const dataSourceRaw = readString("VITE_DATA_SOURCE") || "mock";
if (dataSourceRaw !== "mock" && dataSourceRaw !== "supabase") {
  throw new Error(
    `Invalid VITE_DATA_SOURCE="${dataSourceRaw}". Must be "mock" or "supabase".`,
  );
}
export const DATA_SOURCE: DataSource = dataSourceRaw;

export const TENANT_SLUG: string = readString("VITE_SCHEDLYOPS_TENANT_SLUG") || "demo-barber";

export const SUPABASE_URL: string = readString("VITE_SUPABASE_URL");
export const SUPABASE_ANON_KEY: string = readString("VITE_SUPABASE_ANON_KEY");

if (DATA_SOURCE === "supabase") {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    throw new Error(
      `VITE_DATA_SOURCE=supabase but required env var(s) missing: ${missing.join(", ")}. ` +
        `Set them in Workspace Settings → Build Secrets, or switch VITE_DATA_SOURCE to "mock".`,
    );
  }
}

export const IS_SUPABASE = DATA_SOURCE === "supabase";
export const IS_MOCK = DATA_SOURCE === "mock";
