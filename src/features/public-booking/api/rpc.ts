import { getPublicSupabase } from "@/lib/public-supabase";

export { PublicConfigMissingError, hasPublicSupabaseConfig } from "@/lib/public-supabase";

/**
 * Schema-aware public RPC helper for the unauthenticated booking surface.
 * Uses the dedicated anon `getPublicSupabase()` client.
 */

export type PublicSchema = "core" | "scheduling";

export class PublicRpcError extends Error {
  code: string | undefined;
  schema: PublicSchema;
  fn: string;
  constructor(schema: PublicSchema, fn: string, message: string, code?: string) {
    super(`[${schema}.${fn}] ${message}`);
    this.name = "PublicRpcError";
    this.code = code;
    this.schema = schema;
    this.fn = fn;
  }
}

export async function publicRpc<T = unknown>(
  schema: PublicSchema,
  fn: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await getPublicSupabase()
    .schema(schema)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .rpc(fn as any, args as any);
  if (error) {
    throw new PublicRpcError(
      schema,
      fn,
      error.message ?? "unknown",
      (error as { code?: string }).code,
    );
  }
  return data as T;
}
