/**
 * Runtime environment for SchedlyOps.
 *
 * The data source is normally pinned at build time via VITE_DATA_SOURCE.
 * In preview / dev we additionally honor a localStorage override
 * (`schedlyops:data-source`) so a tester can flip between mock and supabase
 * without rebuilding. The override is ignored on the server (SSR) and is
 * downgraded to "mock" with a recorded reason if the Supabase URL / anon key
 * are not present in the build.
 */

export type DataSource = "mock" | "supabase";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_CONFIG_SOURCE,
} from "./supabase-config";

export { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_CONFIG_SOURCE };

const OVERRIDE_KEY = "schedlyops:data-source";

function readString(name: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[name];
  return typeof raw === "string" ? raw.trim() : "";
}

function readOverride(): DataSource | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(OVERRIDE_KEY);
    if (v === "mock" || v === "supabase") return v;
  } catch {
    /* private mode etc. */
  }
  return null;
}

const envRaw = readString("VITE_DATA_SOURCE") || "mock";
if (envRaw !== "mock" && envRaw !== "supabase") {
  throw new Error(`Invalid VITE_DATA_SOURCE="${envRaw}". Must be "mock" or "supabase".`);
}
const ENV_DATA_SOURCE: DataSource = envRaw;

export const TENANT_SLUG: string = readString("VITE_SCHEDLYOPS_TENANT_SLUG") || "demo-barber";

const HAS_SUPABASE_KEYS = SUPABASE_CONFIG_SOURCE !== "missing";

const override = readOverride();
let effective: DataSource = override ?? ENV_DATA_SOURCE;
let fallbackReason: string | null = null;

if (effective === "supabase" && !HAS_SUPABASE_KEYS) {
  fallbackReason = "Supabase publishable config missing.";
  effective = "mock";
}

export const DATA_SOURCE: DataSource = effective;
export const DATA_SOURCE_SOURCE: "env" | "override" = override ? "override" : "env";
export const DATA_SOURCE_FALLBACK_REASON: string | null = fallbackReason;
export const IS_SUPABASE = DATA_SOURCE === "supabase";
export const IS_MOCK = DATA_SOURCE === "mock";

/**
 * Persist a data-source override and reload so module-scope env re-evaluates.
 * Pass null to clear.
 */
export function setDataSourceOverride(next: DataSource | null): void {
  if (typeof window === "undefined") return;
  try {
    if (next === null) window.localStorage.removeItem(OVERRIDE_KEY);
    else window.localStorage.setItem(OVERRIDE_KEY, next);
  } catch {
    /* ignore */
  }
  window.location.reload();
}
