// DEV publishable client config. Not a secret, but DEV-only. Access is governed by Supabase Auth + RLS + RPC contracts.

const DEV_FALLBACK_URL = "https://cjigkvwnevrhaglzgwvw.supabase.co";
const DEV_FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaWdrdnduZXZyaGFnbHpnd3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjk2MzksImV4cCI6MjA5NDgwNTYzOX0.yJ9ik2GBgFLV6AQRWVZxkSHFU2a13rIjrCHOqq8pT44";

function read(name: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[name];
  return typeof v === "string" ? v.trim() : "";
}

const envUrl = read("VITE_SUPABASE_URL");
const envKey = read("VITE_SUPABASE_ANON_KEY") || read("VITE_SUPABASE_PUBLISHABLE_KEY");

export type SupabaseConfigSource = "env" | "committed-dev-fallback" | "missing";

let source: SupabaseConfigSource;
let url: string;
let key: string;

if (envUrl && envKey) {
  source = "env";
  url = envUrl;
  key = envKey;
} else if (DEV_FALLBACK_URL && DEV_FALLBACK_ANON_KEY) {
  source = "committed-dev-fallback";
  url = DEV_FALLBACK_URL;
  key = DEV_FALLBACK_ANON_KEY;
} else {
  source = "missing";
  url = "";
  key = "";
}

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = key;
export const SUPABASE_CONFIG_SOURCE: SupabaseConfigSource = source;
