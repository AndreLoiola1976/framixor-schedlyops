# SchedlyOps — TODO

Tracked gaps after this pass. Order is rough; demo-blockers first.

## Frontend follow-ups

- **Logo upload** (out of scope this pass). Wire Supabase Storage bucket +
  signed upload, write resulting URL through `p_logo_url`.
- **IANA timezone combobox** for `TenantSettingsSection` (P0_CLOSURE tech-debt
  item — free-text input today, typos break scheduling).
- **Public email edit** in `BusinessProfileForm` — flip the field from
  read-only to editable once `p_public_email` write semantics are confirmed
  (the parameter exists in the RPC signature; pending policy confirmation).
- **Currency edit surface** — decide whether currency belongs in profile or
  settings, then expose it; today it's read-only in both screens.
- **Diagnostics panel** under Settings — surface
  `getLastTenantDiagnostic()` + last profile/settings RPC errors for support.

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
