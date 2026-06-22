# SchedlyOps — Current State

Last updated by this change pass.

## Demo loop status

Manager → Settings → Supabase → demo-barber (public booking).

| Surface | Status | Source of truth |
| --- | --- | --- |
| Operator auth + tenant resolution | ✅ real | `core.operator_current_tenant` |
| Business profile (display name, tagline, description, public phone, website, address parts, country code, logo_url) | ✅ real, editable | `core.operator_(get\|update)_tenant_profile` |
| Workspace settings (timezone, default_locale, country_code, self-service policies, fees) | ✅ real, editable | `core.operator_(get\|update)_tenant_settings` |
| Public tenant profile read (demo-barber) | ✅ real | `core.public_get_tenant_profile(p_slug)` |
| Services / Professionals / Working hours / Bookings CRUD | ✅ real | `scheduling.*` operator RPCs |
| Public booking, availability, slot creation | ✅ real | `scheduling.public_available_slots`, `scheduling.public_create_booking` |

## Confirmed backend contract (no migration needed)

`core.operator_update_tenant_profile` accepts these named parameters (verified
against PostgREST OpenAPI via probe response — full superset returned
`permission_denied` rather than `function-not-found`):

```
p_display_name, p_tagline, p_description,
p_public_phone, p_public_email,
p_website_url, p_logo_url,
p_address_line1, p_address_line2, p_city, p_state, p_postal_code, p_country_code
```

Frontend sends only changed keys; backend treats omitted/null as "leave
unchanged" (mirrors the `operator_update_tenant_settings` contract).

## Read-only by design (this pass)

- `tenants.name` — not edited from the UI. The public branding string is
  `display_name`, not the internal tenant name.
- `public_email` — backend write semantics not yet confirmed; we display it
  but do not send `p_public_email`. Flip to editable once confirmed.
- `currency` — owned by tenant settings, not the profile contract. Surfaced
  read-only in BusinessProfileForm; editable surface (if any) would belong
  in TenantSettingsSection.

## This pass (UX polish #1)

- **Dashboard "Today's appointments"** no longer uses the hardcoded
  `TODAY = "2026-05-28"`. It now computes `YYYY-MM-DD` on mount using the
  tenant timezone (falls back to the browser zone). Client-only computation
  avoids SSR/CSR hydration mismatches.
- **Settings → "Your booking page"** card added. Renders the public booking
  URL from `tenant.slug` using `VITE_PUBLIC_BOOKING_BASE_URL` (falls back to
  `window.location.origin`). Copy-link and Open actions wired with toast
  feedback. When slug is missing it shows a "publish your profile" hint.
- **TopBar** gains a small icon-only "View booking page" button (with tooltip)
  when a slug + URL are available. Hidden when there is nothing to link to,
  so mobile stays uncluttered.
- **Settings → Working hours card** replaced. Previously rendered
  `tenant.hours` which is `[]` in Supabase mode and misleading. Now an
  explanatory card "Hours are configured per professional" with a button
  linking to `/professionals` (where `WorkingHoursDialog` actually lives).
- i18n keys added in EN / ES / pt-BR under `settings.publicPage` and
  `settings.hours.perProfessional*`.

## This pass (Clients v1 — read-only)

- `/clients` no longer shows the "pilot — not implemented" stub. It now
  renders a real read-only customer history derived entirely from existing
  bookings (`useAppointments()`) — **no backend / schema / RPC change.**
- Derivation: `src/lib/derive-clients.ts`
  - Excludes `type === "block"` rows.
  - Excludes rows missing both `customerPhone` and `customerName`.
  - Groups primarily by normalized phone (digits only). Falls back to
    normalized name when phone is missing; a name-only group never merges
    with a phoned group.
  - Aggregates per client: `totalBookings`, `completedCount`,
    `cancelledCount`, `noShowCount` (kept distinct from cancelled),
    `nextAppointment` (earliest future non-cancelled/non-no_show),
    `lastAppointment` (most recent past, any status), favorite professional,
    favorite service, full history newest-first.
  - next/last comparisons use absolute booking instants (`startISO`), so
    they are timezone-independent; the tenant timezone only affects
    display formatting via existing `formatDate`/`formatTime`.
- UI: `ClientsList` (responsive table on `md+`, stacked cards on mobile)
  + `ClientDetailSheet` (right-side drawer with stats + history). Search
  by name or by partial phone digits. Empty state copy when there are no
  bookings; separate "no matches" copy when search filters everything out.
- Strictly read-only: no editing, notes, tags, manual merge, customer
  creation, memberships, payments, or SMS.
- The legacy `ClientsTable.tsx` is left in place (no other importers) but
  unused; safe to remove in a follow-up.
- i18n keys added in EN / ES / pt-BR under `clients.{emptyState,
  emptySearch, noPhone, columns.{phone,totalBookings,nextVisit,
  lastService}, mobile.*, detail.*}`. The unused `pilotBadge` /
  `pilotMessage` keys were removed.
- Tests: `tests/derive-clients.test.ts` covers phone grouping, name
  fallback, block exclusion, status counts, next/last selection, and
  search.

## Known gaps (see TODO.md)

Logo upload, professional public/social/contact fields, payments, WhatsApp,
dashboard KPIs (revenue, deltas), tenant switcher, IANA timezone combobox,
Admin-master completeness, mobile-responsive Appointments grid.
