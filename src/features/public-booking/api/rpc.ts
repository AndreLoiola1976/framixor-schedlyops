import { getSupabase } from "@/lib/supabase";

/**
 * Schema-aware public RPC helper for the unauthenticated booking surface.
 *
 * Modeled after demo-barber's `rpc.ts`. Intentionally separate from the
 * operator-oriented `src/lib/data-source/supabase.ts::call` helper, which is
 * hardcoded to `.schema("scheduling")` and assumes an authenticated tenant
 * context. The public flow spans two schemas (`core`, `scheduling`) and must
 * not depend on session/JWT.
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
  const { data, error } = await getSupabase()
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
