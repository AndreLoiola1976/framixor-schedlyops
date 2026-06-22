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
- **Mobile-responsive Appointments list**: `AppointmentRow` is a 12-col grid
  that squeezes below `md`. Move to a stacked card layout on small screens.
- **Dashboard KPI deltas + revenue** still missing (all deltas are `0`,
  revenue chart only renders in mock mode).
- **Public email edit** in `BusinessProfileForm` — flip the field from
  read-only to editable once `p_public_email` write semantics are confirmed.
- **Currency edit surface** — decide whether currency belongs in profile or
  settings, then expose it; today it's read-only in both screens.
- **Diagnostics panel** under Settings — surface
  `getLastTenantDiagnostic()` + last profile/settings RPC errors for support.

## Done in the last pass

- Dashboard "Today's appointments" now uses real today (tenant-tz aware).
- Settings exposes the public booking URL (Copy + Open) and a TopBar
  shortcut.
- Settings Working-hours card replaced with a per-professional explainer +
  link to `/professionals`.

## Backend follow-ups (not in scope here)

- Professional public/social/contact fields (handle, IG/WhatsApp, bio).
- Payments (Stripe / Mercado Pago).
- WhatsApp notifications + opt-in.
- Admin-master tenant CRUD completeness.

## Explicit non-goals for the demo

- Multi-tenant switcher in the operator UI.
- Dashboard KPI surface beyond what already exists.
- Theme/colour-token engine.
- Any RLS/migration/schema change.
