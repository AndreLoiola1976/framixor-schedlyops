## Final Frontend Cleanup Before Freeze

### 1. Clean up `src/routes/__root.tsx` head metadata
Remove these 5 duplicate/leftover meta entries (lines 96–100):
- `name: "description"` containing "Schedule Harmony is a React/TypeScript application..."
- `property: "og:description"` containing "Schedule Harmony is a React/TypeScript application..."
- `name: "twitter:description"` containing "Schedule Harmony is a React/TypeScript application..."
- `property: "og:image"` with Lovable preview image URL
- `name: "twitter:image"` with Lovable preview image URL

Keep the SchedlyOps entries above them (title, description, og:title, og:description, og:type, twitter:card, twitter:title).

### 2. Rename `package.json` `name`
Change `"name": "tanstack_start_ts"` to `"name": "schedlyops"`.

### 3. Verification
Run typecheck, lint, check:secrets, test, and build to confirm all checks pass.

### 4. Service price input fix
`ServiceFormDialog` now treats the price field as a normal monetary input
(`type="text"`, `inputMode="decimal"`) instead of raw cents. Comma decimals
(e.g. `47,90`) are normalized to dot before parsing. Invalid/empty/negative
values block submit with an inline error. The value is converted to cents with
`Math.round(parsed * 100)` and sent through the existing `priceCents` mutation
contract unchanged. `formatCurrency` no longer truncates fraction digits, so
cents render correctly in service cards and dashboard KPIs. i18n label renamed
from `priceCents` to `price` across EN/ES/pt-BR with a new `priceInvalid` key.
No backend/schema/RPC changes.

### 5. Service activation toggle fix
`ServiceCard` only showed a **Disable** button for active services. Once a
service was disabled, there was no way to reactivate it from the UI.
- Added an **Enable** button (icon `Power`) that appears when `service.active`
  is `false`, calling `useUpdateService()` with the full service payload plus
  `isActive: true` to preserve all fields.
- Action buttons are disabled while either mutation is pending.
- Added `common.enable` to EN/ES/pt-BR dictionaries.
- Backend unchanged: `operator_update_service` already accepts `p_is_active`.

No UI changes, no provider/route/component/config/test refactors.
### 6. Real Settings loop (tenant profile)
`BusinessProfileForm` is editable again, backed by the confirmed
`core.operator_(get|update)_tenant_profile` RPCs. `BrandingSection` gained a
`logo_url` text input with live preview (no upload). `getTenant()` composes
`operator_current_tenant + operator_get_tenant_profile +
operator_get_tenant_settings`, so `useTenant()` consumers (TopBar,
booking dialogs, branding) reflect saved edits without a hard reload.
`public_email` and `currency` remain read-only this pass; `tenants.name` is
not written — `display_name` is the public branding string. No schema, RLS,
or migration changes.
