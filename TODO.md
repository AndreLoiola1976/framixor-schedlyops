# SchedlyOps — TODO

Tracked gaps after this pass. Order is rough; demo-blockers first.

## Frontend follow-ups

- **Set `VITE_PUBLIC_BOOKING_BASE_URL`** for the deployed storefront host
  (e.g. `https://demo-barber.lovable.app`). Without it the "Your booking
  page" card and TopBar link fall back to the current operator origin,
  which works locally but is wrong in production.
- **Logo upload** (out of scope this pass). Wire Supabase Storage bucket +
  signed upload, write resulting URL through `p_logo_url`.
- **IANA timezone combobox** for `TenantSettingsSection` (P0_CLOSURE tech-debt
  item — free-text input today, typos break scheduling and now also break
  "today's appointments" computation).
- ~~**Mobile-responsive Appointments list**~~ — shipped: mobile renders
  `AppointmentCard`, desktop keeps the 12-col `AppointmentRow`.
- **Appointments date-range picker** — explicit start/end picker beyond the
  quick filters (today/upcoming/completed/cancelled/no-show/all).
- **Appointments bulk actions / CSV export** — deferred.
- **Dashboard KPI deltas + revenue** still missing (all deltas are `0`,
  revenue chart only renders in mock mode).
- **Public email edit** in `BusinessProfileForm` — flip the field from
  read-only to editable once `p_public_email` write semantics are confirmed.
- **Currency edit surface** — decide whether currency belongs in profile or
  settings, then expose it; today it's read-only in both screens.
- **Diagnostics panel** under Settings — surface
  `getLastTenantDiagnostic()` + last profile/settings RPC errors for support.

## Clients follow-ups (deferred from this pass)

- Smarter phone normalization (E.164 / country-code aware): today
  `+1 555 111 2222` and `5551112222` are treated as different clients
  because the digit strings differ. Plumb tenant `countryCode` through
  `deriveClients` to collapse leading-1 vs not for US, etc.
- Persisted customer entity (backend) — owns notes, tags, lifetime value,
  GDPR delete, and lets clients exist before their first booking.
- Per-client CSV export.
- Click "favorite professional" / "favorite service" to filter
  `/appointments`.
- Delete unused `src/components/features/clients/ClientsTable.tsx` once
  confirmed no consumer (currently no importers).

## Done in the last pass

- Dashboard daily command center (Supabase mode): today summary cards,
  next appointment, today schedule with quick lifecycle actions, and
  per-professional grouping. Shared `today-key` helper + tested
  `dashboard-today` derivation.

## Done previously

- Dashboard "Today's appointments" now uses real today (tenant-tz aware).
- Settings exposes the public booking URL (Copy + Open) and a TopBar
  shortcut.
- Settings Working-hours card replaced with a per-professional explainer +
  link to `/professionals`.
- `/clients` v1: read-only client list + detail sheet derived from
  bookings, with search, mobile layout, and EN/ES/pt-BR copy.

## Dashboard follow-ups

- Surface reschedule/edit on the dashboard once the dialogs are
  factored out of `AppointmentRow` for reuse.
- Real KPI deltas + revenue sparkline (still all `0` / mock-only).
- Per-professional working-hours overlay (gaps / idle time today).

## Backend follow-ups (not in scope here)

- Professional public/social/contact fields (handle, IG/WhatsApp, bio).
- Payments (Stripe / Mercado Pago).
- WhatsApp notifications + opt-in.
- Admin-master tenant CRUD completeness.
- **Waitlist + walk-in queue (planned, deferred behind backend)** — see
  `.lovable/plan.md` for the contract-first plan. Requires, in order:
  (1) `bookings.source` column (`online|operator|walkin`, default `online`);
  (2) `waitlist_status` enum + `waitlist_entries` table with RLS + grants;
  (3) RPCs `operator_list_waitlist`, `operator_add_walkin`,
  `operator_skip_waitlist_entry`, `operator_requeue_waitlist_entry`,
  `operator_cancel_waitlist_entry`, `operator_reorder_waitlist`,
  `operator_update_walkin`, `operator_seat_waitlist_entry` (atomic:
  creates booking + transitions entry in one tx, with typed errors
  `waitlist_entry_not_waiting`, `waitlist_seat_conflict`, etc.).
  Backend must adapt table/column names to actual repo schema and reuse
  the existing booking-creation constraint helpers. **No frontend route,
  dashboard card, walk-in badge, or mock adapter implementation lands
  until the RPCs are deployed and exercised against a real tenant.**


## Explicit non-goals for the demo

- Multi-tenant switcher in the operator UI.
- Dashboard KPI surface beyond what already exists.
- Theme/colour-token engine.
- Any RLS/migration/schema change.
