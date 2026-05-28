
# Tenant branding via theme tokens

Components already consume semantic tokens (`bg-primary`, `text-primary-foreground`, `bg-sidebar`, `bg-accent`, etc.) defined in `src/styles.css`. Branding becomes data: the active tenant declares its name, logo placeholder, and four core colors; a small provider writes those colors into the existing CSS custom properties at runtime. The rendered design is visually identical to today because the defaults mirror the current `:root` values.

## Files

**New**
- `src/types/branding.ts` — `Branding` type: `name`, `logoInitials`, `primary`, `secondary`, `background`, `foreground` (all strings; colors as `oklch(...)`).
- `src/config/theme.ts` — `defaultBranding: Branding` mirroring the current `:root` token values so the result is visually identical until a tenant overrides them.
- `src/hooks/useBranding.ts` — returns `activeTenant.branding ?? defaultBranding`.
- `src/components/layout/ThemeProvider.tsx` — client provider that writes a fixed list of CSS variables onto `document.documentElement.style` whenever branding changes. Renders `children` only — no DOM wrapper, no visual change.
- `tests/branding.test.ts` — asserts `activeTenant.branding` exists with all 6 required fields as non-empty strings, and that each color field is an `oklch(...)` value.

**Modified (minimal)**
- `src/types/tenant.ts` — add optional `branding?: Branding`.
- `src/config/tenant.ts` — set `branding: defaultBranding` on `activeTenant` (existing `name` / `logoInitials` kept; no rename).
- `src/routes/__root.tsx` — wrap existing tree with `<ThemeProvider>` inside `LocaleProvider`. No other change.

## ThemeProvider contract

- Holds a single `MANAGED_VARS` array: `--primary`, `--secondary`, `--background`, `--foreground`, `--sidebar-primary` (mirrors primary), `--ring` (mirrors primary).
- Effect sets only those properties from current branding.
- Cleanup iterates the same `MANAGED_VARS` list and calls `root.style.removeProperty(name)` for each — nothing else is touched. Unrelated variables on `:root` are never read, reset, or rewritten.

## Component scope

Sidebar, top bar, primary buttons, status badges, and dashboard highlights already use semantic tokens — no component code changes. Branding flows through CSS variables `ThemeProvider` writes.

## Out of scope

No tenant switcher, no Supabase, no auth, no real logo upload, no per-tenant route, no token rename, no dark-mode token edits.

## Verification

- `bun run typecheck`, `bun run lint`, `bun run check:secrets`, `bun run test`, `bun run build` — all must pass.
- Existing 12 tests stay green; new branding test adds 2 cases (~10 assertions).
