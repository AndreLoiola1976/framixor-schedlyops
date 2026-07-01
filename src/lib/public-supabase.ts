import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIG_SOURCE, SUPABASE_URL } from "./supabase-config";

/**
 * Dedicated anon Supabase client for the unauthenticated public booking
 * surface. Intentionally independent of `getSupabase()` (which is gated on
 * the operator IS_SUPABASE data-source toggle and throws in mock mode).
 *
 * The public booking flow must work for anonymous visitors regardless of the
 * operator UI's data-source mode, as long as Supabase publishable config is
 * present in the build.
 */

let client: SupabaseClient | null = null;

export class PublicConfigMissingError extends Error {
  constructor() {
    super("Public booking is not configured: missing Supabase publishable config.");
    this.name = "PublicConfigMissingError";
  }
}

export function hasPublicSupabaseConfig(): boolean {
  return SUPABASE_CONFIG_SOURCE !== "missing" && !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

export function getPublicSupabase(): SupabaseClient {
  if (!hasPublicSupabaseConfig()) throw new PublicConfigMissingError();
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}
