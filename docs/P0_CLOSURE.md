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

## Post-closure frontend fix (price input)

- **Bug:** `ServiceFormDialog` bound the price input 1:1 to `priceCents`.
  Users entered `25` expecting $25.00, but the app sent 25 cents to the
  backend. `formatCurrency` used `maximumFractionDigits: 0`, so 25 cents
  rendered as "$0", making it look like the price was zeroed.
- **Fix files:**
  - `src/components/features/services/ServiceFormDialog.tsx` — input now
    uses `type="text"` with `inputMode="decimal"`; value is normalized
    (comma→dot), validated, and converted to cents via
    `Math.round(parsed * 100)` before calling existing create/update
    mutations. Edit mode pre-fills with `(priceCents / 100).toFixed(2)`.
  - `src/lib/format.ts` — removed `maximumFractionDigits: 0` from
    `formatCurrency` so cents display correctly everywhere (service cards,
    dashboard KPIs, top services).
  - `src/i18n/en.ts`, `es.ts`, `pt-BR.ts` — renamed label key from
    `priceCents` to `price`; added `priceInvalid` error string.
- **Backend unchanged:** `operator_create_service` / `operator_update_service`
  already accepted `p_price_cents` correctly. No schema, RPC, RLS, or
  migration changes were made.

## Backend safety confirmation

No Supabase backend, schema, RLS, RPC, migration, auth, storage, seed, or
edge-function changes were made in this closure pass. No service-role key
was used. All changes are frontend-only and respect existing RLS.
