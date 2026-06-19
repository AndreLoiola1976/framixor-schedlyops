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

## Known gaps (see TODO.md)

Logo upload, professional public/social/contact fields, payments, WhatsApp,
dashboard KPIs, tenant switcher, IANA timezone combobox, Admin-master
completeness.
