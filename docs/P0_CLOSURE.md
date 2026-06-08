# P0 Closure Report — SchedlyOps × Supabase DEV (migration 0023 / hotfix 0024)

Validated in preview against Supabase DEV.

## Validated P0 surface

| Capability | RPC | Status |
| --- | --- | --- |
| Operator booking create | `scheduling.operator_create_booking` | ✅ returns `[{booking_id, manage_token}]`; manage link shown once |
| Operator cancel | `scheduling.operator_cancel_booking` | ✅ |
| Operator reschedule | `scheduling.operator_reschedule_booking` (`p_starts_at`) | ✅ |
| Operator update | `scheduling.operator_update_booking` | ✅ |
| Operator complete | `scheduling.operator_complete_booking` | ✅ UI-gated to past appointments |
| Operator no-show | `scheduling.operator_mark_no_show` | ✅ UI-gated to past appointments |
| Public availability | `scheduling.public_available_slots` | ✅ single source of truth; booked slots disappear |
| Slot conflict mapping | — | ✅ `slot_taken` / overlap → "That time was just taken" |
| Tenant settings read | `core.operator_get_tenant_settings` | ✅ form seeds from backend row |
| Tenant settings write | `core.operator_update_tenant_settings` | ✅ only changed `p_*` keys sent; cache invalidates on success |

## Mock surfaces removed / hidden in this pass

- **Business Profile Save (mock).** The "Saved (mock)" toast in
  `BusinessProfileForm` was misleading — migration 0023 does not expose
  RPCs to update tenant name/email/phone/address/currency. The component is
  now a read-only display with an explicit note that editing is unavailable.
  Editable operational fields remain in `TenantSettingsSection`.
- **Mock tenant fallback leaking into Supabase mode.** `useTenant`'s
  Supabase fallback was spreading `activeTenant`, which leaked Glow Studio's
  San Francisco address / `America/Los_Angeles` timezone / `+1 (415)` phone /
  `USD` currency whenever the real tenant payload was missing a field. The
  Supabase fallback is now fully neutral (empty strings, no hours, neutral
  `--` initials). Mock mode (`VITE_DATA_SOURCE !== "supabase"`) is unchanged.

## Files changed in this closure pass

- `src/components/features/settings/BusinessProfileForm.tsx` — replaced
  mock-saving form with read-only display.
- `src/hooks/useTenant.ts` — neutralized Supabase fallback so mock contact /
  timezone / currency never leak into a real tenant context.
- `docs/P0_CLOSURE.md` — this report.

## Tech debt registered

- **Timezone selector** — `TenantSettingsSection`'s timezone field is a
  free-text `<Input>`. Replace with an IANA timezone combobox
  (`Intl.supportedValuesOf('timeZone')` + shadcn `Command`). Typos silently
  break scheduling math. Priority: P1. Effort: ~1 h.
- **Business profile RPCs** — once backend exposes update RPCs for tenant
  name / email / phone / address / currency, restore editable fields in
  `BusinessProfileForm` and wire a `useUpdateBusinessProfile` hook with
  optimistic cache update against `qk.tenant`.

## P1 deferred (no work in this pass)

- Public manage page `/b/{token}` (customer self-cancel / self-reschedule
  respecting tenant policy flags).
- Diagnostics panel surfaced under Settings (tenant / RLS / RPC health).
- Team / Users invite UI.
- Self-service `/activate` flow.

## Backend safety confirmation

No Supabase backend, schema, RLS, RPC, migration, auth, storage, seed, or
edge-function changes were made in this closure pass. No service-role key
was used. All changes are frontend-only and respect existing RLS.
