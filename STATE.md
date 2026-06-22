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

## This pass (Dashboard daily command center)

- `/dashboard` (Supabase / `derived` mode only) reorganized into an
  operator-facing daily view. Mock mode is unchanged.
- New layout: `KpiGrid` (unchanged) → `TodaySummaryCards` →
  `TodayScheduleList` + `NextAppointmentCard` (lg 2/1 split) →
  `ByProfessionalToday`.
- New shared lib `src/lib/today-key.ts` (`computeTodayKey` +
  `useTodayKey` mount-gated hook). `UpcomingAppointments` now imports
  from it instead of duplicating the helper.
- New pure derivation `src/lib/dashboard-today.ts`:
  - Includes blocks in `todayAppointments` for calendar context;
    excludes them from `customerAppointments`, counts, revenue, and
    next-appointment selection.
  - `nextAppointment` = earliest future row that is **not** block,
    cancelled, no_show, or completed.
  - `counts`: total / completed / cancelled / noShow (kept distinct).
  - `estimatedRevenueCents`: sum of `priceCents` for **completed** customer
    appointments only — confirmed bookings never count as revenue.
  - `byProfessional`: one bucket per **active** professional (empty buckets
    rendered so each pro shows an empty-state).
- Quick actions reuse `useCompleteBooking` / `useCancelBooking` /
  `useMarkNoShow` from `useSchedulingMutations` via a new
  `LifecycleQuickActions` component. Same `confirmed`-only gating, same
  `elapsed` guard, same confirmation copy as `AppointmentRow` — no
  lifecycle logic duplicated, only the small dropdown shell.
- Reschedule / edit dialogs are intentionally NOT surfaced on the dashboard.
- Blocks render as a visually distinct row (muted bg, "Blocked" chip, no
  actions).
- Dashboard derives from `useAppointments` / `useProfessionals` /
  `useServices` / `useTenant` only — no `useClients` dependency.
- i18n keys added in EN / ES / pt-BR under `dashboard.today.{summary,
  next, schedule, byPro}`.
- Tests: `tests/dashboard-today.test.ts` covers `computeTodayKey`
  including America/New_York (UTC date that is the previous day in NY),
  block exclusion, status counts, next-appointment selection rules,
  completed-only revenue, and per-professional grouping with empty
  buckets for active pros.

## This pass (Appointments ops polish)

- `/appointments` toolbar reworked: quick-filter chips
  (`today | upcoming | completed | cancelled | no_show | all`, default
  `today`), debounced text search, and the existing professional
  `Select`. Old status `Select` and disabled date-range button are gone.
- Active-filter summary bar (chip + search badge + count) sits above the
  list so an empty `today` reads as "filtered to 0" rather than "missing
  data".
- Search matches `customerName`, `customerPhone` (digits substring),
  `service.name`, `professional.name` — case-insensitive. Blocks are
  always excluded from search results.
- New pure filter `src/lib/appointments-filter.ts`. Block semantics:
  visible under `today` (tz-matched), `upcoming` (future only), and
  `all`; hidden under status-specific filters and from search.
- `today` and per-day grouping both go through new `dayKeyInTz` helper in
  `src/lib/today-key.ts`, so tenant timezone is applied consistently to
  the "today" key and every appointment's day key.
- Mobile: new `AppointmentCard` renders below `md`; the existing 12-col
  `AppointmentRow` renders at `md+`. Chips horizontally scroll on mobile;
  search input is full-width; no horizontal overflow at 375px.
- `AppointmentRowActions` is a behavior-preserving extraction of the
  action menu (reschedule / edit / complete / no-show / cancel) shared
  by row and card. Lifecycle mutations, gating, confirmation dialogs,
  and toasts are unchanged.
- Empty states: `AppointmentsEmpty` shows context-specific copy for
  today / upcoming / no-search-matches; otherwise falls back to the
  generic empty.
- i18n keys added in EN / ES / pt-BR under
  `appointments.{searchPlaceholder, quickFilters.*, empty.*}`.
- Tests: `tests/appointments-filter.test.ts` covers today + tz edge
  (America/New_York where UTC instant falls on the prior local day),
  upcoming inclusion/exclusion rules with future blocks, status filters
  excluding blocks, search across all fields, search excluding blocks,
  and professional + quick combination.

## Planned, deferred behind backend

- **Waitlist + walk-in queue** — contract-first plan accepted; see
  `.lovable/plan.md` and the entry in TODO.md → "Backend follow-ups".
  No frontend code is being written for this feature until the
  `bookings.source` column, `waitlist_entries` table, and the eight
  `operator_*_waitlist*` RPCs (including atomic `operator_seat_waitlist_entry`)
  exist and have been tested against a real tenant. The mock adapter
  will not simulate seating; the route stays unbuilt until the contract
  lands.

## Known gaps (see TODO.md)

Logo upload, professional public/social/contact fields, payments, WhatsApp,
dashboard KPI deltas (still 0), tenant switcher, IANA timezone combobox,
Admin-master completeness, waitlist (planned, backend-dependent).

