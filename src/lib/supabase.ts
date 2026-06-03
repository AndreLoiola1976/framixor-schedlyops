import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { IS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

let client: SupabaseClient | null = null;

/**
 * Lazy Supabase browser client. Only instantiated when VITE_DATA_SOURCE=supabase.
 * Calling this in mock mode throws — guard with IS_SUPABASE first.
 */
export function getSupabase(): SupabaseClient {
  if (!IS_SUPABASE) {
    throw new Error("Supabase client requested while VITE_DATA_SOURCE!=supabase");
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
