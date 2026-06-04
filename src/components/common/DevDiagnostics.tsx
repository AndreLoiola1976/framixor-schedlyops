import { useState } from "react";
import { DATA_SOURCE, IS_SUPABASE, TENANT_SLUG } from "@/lib/env";
import { useSession } from "@/hooks/useSession";
import { useTenantQuery } from "@/hooks/useTenant";
import { getLastTenantDiagnostic } from "@/lib/data-source";

/**
 * Floating DEV-only diagnostic panel. Renders in dev builds only (stripped
 * from production). Shows datasource mode, session, tenant query state, and
 * the last raw operator_current_tenant response.
 */
export function DevDiagnostics() {
  const [open, setOpen] = useState(true);
  const { loading, session } = useSession();
  const tenant = useTenantQuery();

  if (!import.meta.env.DEV) return null;

  const diag = IS_SUPABASE ? getLastTenantDiagnostic() : null;

  return (
    <div className="fixed bottom-3 right-3 z-50 max-w-sm rounded-md border border-border bg-background/95 p-3 text-[11px] shadow-lg backdrop-blur">
      <div className="mb-1 flex items-center justify-between gap-2">
        <strong className="font-mono uppercase tracking-wide text-muted-foreground">
          dev diagnostics
        </strong>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-accent"
        >
          {open ? "hide" : "show"}
        </button>
      </div>
      {open ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono">
          <dt className="text-muted-foreground">mode</dt>
          <dd>{DATA_SOURCE}</dd>
          <dt className="text-muted-foreground">tenantSlug</dt>
          <dd>{TENANT_SLUG}</dd>
          <dt className="text-muted-foreground">session</dt>
          <dd>{loading ? "loading…" : session ? "ok" : "anon"}</dd>
          <dt className="text-muted-foreground">user.id</dt>
          <dd className="truncate">{session?.user?.id ?? "—"}</dd>
          <dt className="text-muted-foreground">user.email</dt>
          <dd className="truncate">{session?.user?.email ?? "—"}</dd>
          <dt className="text-muted-foreground">tenant.q</dt>
          <dd>
            {tenant.fetchStatus}/{tenant.status}
          </dd>
          <dt className="text-muted-foreground">tenant</dt>
          <dd className="truncate">
            {tenant.data ? `${tenant.data.slug} (${tenant.data.id.slice(0, 8)}…)` : "null"}
          </dd>
          <dt className="text-muted-foreground">tenant.err</dt>
          <dd className="truncate text-destructive">
            {(tenant.error as Error | null)?.message ?? "—"}
          </dd>
          {diag ? (
            <>
              <dt className="text-muted-foreground">rpc.reason</dt>
              <dd>{diag.reason}</dd>
              <dt className="text-muted-foreground">rpc.rows</dt>
              <dd>{diag.rawCount ?? "—"}</dd>
              <dt className="text-muted-foreground">rpc.err</dt>
              <dd className="truncate text-destructive">{diag.error ?? "—"}</dd>
              <dt className="col-span-2 mt-1 text-muted-foreground">rpc.raw</dt>
              <dd className="col-span-2 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-muted/50 p-1 text-[10px]">
                {JSON.stringify(diag.raw, null, 2)}
              </dd>
            </>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}
