import { useState } from "react";
import {
  DATA_SOURCE,
  DATA_SOURCE_FALLBACK_REASON,
  DATA_SOURCE_SOURCE,
  IS_SUPABASE,
  SUPABASE_CONFIG_SOURCE,
  TENANT_SLUG,
  setDataSourceOverride,
} from "@/lib/env";
import { useSession, signOut } from "@/hooks/useSession";
import { useTenantQuery } from "@/hooks/useTenant";
import { getLastTenantDiagnostic } from "@/lib/data-source";

/**
 * Floating diagnostic + mode switcher. Visible in dev and preview so a tester
 * can flip between mock and supabase without a rebuild.
 */
export function DevDiagnostics() {
  const [open, setOpen] = useState(true);
  const { loading, session } = useSession();
  const tenant = useTenantQuery();

  const diag = IS_SUPABASE ? getLastTenantDiagnostic() : null;
  const sessionLabel = !IS_SUPABASE
    ? "mock"
    : loading
      ? "loading…"
      : session
        ? "authenticated"
        : "signed-out";

  return (
    <div className="fixed bottom-3 right-3 z-50 max-w-sm rounded-md border border-border bg-background/95 p-3 text-[11px] shadow-lg backdrop-blur">
      <div className="mb-1 flex items-center justify-between gap-2">
        <strong className="font-mono uppercase tracking-wide text-muted-foreground">
          diagnostics
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
        <>
          <div className="mb-2 flex flex-wrap items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">mode:</span>
            <button
              type="button"
              onClick={() => setDataSourceOverride("supabase")}
              disabled={DATA_SOURCE === "supabase"}
              className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-accent disabled:bg-primary disabled:text-primary-foreground disabled:opacity-100"
            >
              supabase
            </button>
            <button
              type="button"
              onClick={() => setDataSourceOverride("mock")}
              disabled={DATA_SOURCE === "mock"}
              className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-accent disabled:bg-primary disabled:text-primary-foreground disabled:opacity-100"
            >
              mock
            </button>
            <button
              type="button"
              onClick={() => setDataSourceOverride(null)}
              className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-accent"
              title="Clear localStorage override and use VITE_DATA_SOURCE"
            >
              reset
            </button>
            {IS_SUPABASE && session ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="ml-auto rounded border border-destructive px-1.5 py-0.5 text-[10px] text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                sign out
              </button>
            ) : null}
          </div>
          {DATA_SOURCE_FALLBACK_REASON ? (
            <p className="mb-2 rounded border border-destructive/50 bg-destructive/10 p-1.5 text-[10px] text-destructive">
              {DATA_SOURCE_FALLBACK_REASON}
            </p>
          ) : null}
          <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono">
            <dt className="text-muted-foreground">mode</dt>
            <dd>
              {DATA_SOURCE} <span className="text-muted-foreground">({DATA_SOURCE_SOURCE})</span>
            </dd>
            <dt className="text-muted-foreground">tenantSlug</dt>
            <dd>{TENANT_SLUG}</dd>
            <dt className="text-muted-foreground">session</dt>
            <dd>{sessionLabel}</dd>
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
        </>
      ) : null}
    </div>
  );
}
