# AI Change Report

## Pass: real Settings loop — `operator_*_tenant_profile` wired

### Goal
Replace the read-only "mock" business profile with a real form backed by the
confirmed `core.operator_(get|update)_tenant_profile` RPCs, and compose
profile + settings into `useTenant()` so the rest of the app reflects the
manager's edits without a hard reload. demo-barber (anon, public) already
reads `core.public_get_tenant_profile(p_slug)`, so no work was required
there.

### Contract verification
Before writing UI, the exact parameter names of
`core.operator_update_tenant_profile` were confirmed via a PostgREST probe:
sending the full candidate superset returned `42501 permission denied`
(function matched, auth refused) instead of `PGRST202 function not found`.
Accepted names used:

```
p_display_name, p_tagline, p_description,
p_public_phone, p_public_email,
p_website_url, p_logo_url,
p_address_line1, p_address_line2, p_city, p_state, p_postal_code, p_country_code
```

No generic `p_address` field is sent. `tenants.name` is never written.

### Files added
- `src/lib/tenant-profile.ts` — get/update wrappers + parser (mirrors `tenant-settings.ts`).
- `src/hooks/useTenantProfile.ts` — query + mutation hook; invalidates `qk.tenant` and the profile key on success.
- `STATE.md`, `TODO.md`, `AI_CHANGE_REPORT.md` — new docs.

### Files changed
- `src/lib/data-source/supabase.ts` — `getTenant()` now composes
  `operator_current_tenant + operator_get_tenant_profile +
  operator_get_tenant_settings` in parallel (`Promise.allSettled`). Profile /
  settings failures degrade to neutral fields and log
  `[SCHEDLYOPS_TENANT]` diagnostics; they never throw. Hardcoded
  `"UTC"/"USD"/"en-US"` removed from `adaptTenant`.
- `src/types/tenant.ts` — added optional `displayName`, `tagline`,
  `description`, `websiteUrl`, `logoUrl`, `countryCode`. Existing required
  fields untouched (mock data source still satisfies the type).
- `src/components/features/settings/BusinessProfileForm.tsx` — controlled
  form with the editable fields above; `public_email` and `currency`
  remain read-only with explanatory copy. Submits only changed keys.
- `src/components/features/settings/BrandingSection.tsx` — added
  `logo_url` text input + live preview (image with `onError` fallback to
  the existing initials tile). No upload.
- `docs/P0_CLOSURE.md` — appended a "Post-closure: tenant profile RPC wired"
  note marking the prior tech-debt item resolved.
- `.lovable/plan.md` — appended this pass entry.

### Untouched
Auth, env, supabase client, `tenant-settings.ts`, `TenantSettingsSection`,
services / professionals / working hours / bookings code, public booking lib,
mock data source. No migrations, RLS, payments, WhatsApp, KPIs, tenant
switcher, professional social/contact, admin-master changes.

### Acceptance
- Manager edits supported public profile fields → Save → toast → values
  persist on hard refresh.
- Manager edits `logo_url` → preview updates → demo-barber reflects it via
  `public_get_tenant_profile`.
- Manager edits timezone/locale/country/policies → still saves via
  `operator_update_tenant_settings`.
- TopBar / BrandingSection / dialogs reflect `display_name` and `logo_url`
  through `useTenant()` immediately after save (cache invalidated).
- No "Saved (mock)" copy remains on wired fields.
- No schema/RLS/security regression.
