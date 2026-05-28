
# SchedlyOps — Implementation Plan

A clean, modern SaaS dashboard for beauty & wellness businesses (salons, spas, barbers) to manage appointments, services, professionals, and clients. Mock-data only in this first version, but structured so a future Supabase backend and multi-tenant mode drop in without rewriting components.

## Design direction

- Clean modern SaaS look (Linear/Stripe family): neutral palette, generous whitespace, restrained accent color, data-dense but breathable.
- Persistent left sidebar (shadcn `Sidebar`, `collapsible="icon"`) + top bar with tenant switcher placeholder, search, user menu.
- Typography pairing: a refined geometric sans for headings + neutral sans for body (defined as design tokens, not hardcoded).
- All colors live as semantic tokens in `src/styles.css` (oklch). Components only reference tokens like `bg-background`, `text-muted-foreground`, `bg-primary`.

## Folder structure

```text
src/
  routes/
    __root.tsx                  layout with sidebar + topbar
    index.tsx                   redirects to /dashboard
    dashboard.tsx
    appointments.tsx
    services.tsx
    professionals.tsx
    clients.tsx
    settings.tsx
  components/
    layout/
      AppSidebar.tsx
      TopBar.tsx
      PageHeader.tsx
    ui/                         (existing shadcn)
    common/
      StatCard.tsx
      EmptyState.tsx
      StatusBadge.tsx
      DataTable.tsx             thin wrapper around shadcn table
      SectionCard.tsx
    features/
      dashboard/
        KpiGrid.tsx
        RevenueChart.tsx
        UpcomingAppointments.tsx
        TopServices.tsx
      appointments/
        AppointmentsList.tsx
        AppointmentRow.tsx
        AppointmentFilters.tsx
      services/
        ServicesGrid.tsx
        ServiceCard.tsx
      professionals/
        ProfessionalsGrid.tsx
        ProfessionalCard.tsx
      clients/
        ClientsTable.tsx
      settings/
        BusinessProfileForm.tsx
        BrandingSection.tsx
  config/
    tenant.ts                   active tenant + business profile
    navigation.ts               sidebar items + labels
    services.ts                 mock services
    professionals.ts            mock professionals
    clients.ts                  mock clients
    appointments.ts             mock appointments
    statuses.ts                 appointment status definitions + colors
    metrics.ts                  dashboard KPI definitions + mock series
    theme.ts                    semantic token mapping helpers (if needed)
  i18n/
    en.ts                       all user-facing strings, namespaced
    useT.ts                     tiny hook returning the active dictionary
  types/
    tenant.ts
    service.ts
    professional.ts
    client.ts
    appointment.ts
    navigation.ts
    metric.ts
  hooks/
    useTenant.ts                returns active tenant (mock for now)
    useAppointments.ts          reads from mock data, future Supabase swap
    useServices.ts
    useProfessionals.ts
    useClients.ts
    useDashboardMetrics.ts
  lib/
    utils.ts                    (existing)
    format.ts                   currency, date, duration formatters
```

Rules enforced by structure:
- Pages compose feature components; they don't hold business data.
- Feature components receive data via hooks; hooks read from `config/*` today, and will read from Supabase later — the component contract doesn't change.
- All copy comes from `i18n/en.ts` via `useT()`; no inline English strings in feature components.
- All semantic colors via tokens in `src/styles.css`.

## Screens

1. **Dashboard** — KPI grid (revenue, bookings, occupancy %, new clients), revenue line chart (recharts), today's upcoming appointments list, top services bar.
2. **Appointments** — filterable list view (date range, professional, status), status badges, quick actions (mock). Day grouping headers.
3. **Services** — card grid with price, duration, category, assigned professionals.
4. **Professionals** — card grid with avatar, specialties, working hours summary, services count.
5. **Clients** — searchable/sortable table: name, contact, total visits, last visit, lifetime value.
6. **Settings** — Business profile (name, logo, address, hours), branding placeholders, tenant info card with note that multi-tenant switching arrives later.

## Future-readiness (prepared, not implemented)

- **Supabase**: hook layer (`useAppointments`, etc.) is the only place that touches data; swapping to TanStack Query + serverFns later is mechanical.
- **Multi-tenant**: `useTenant()` returns the single active tenant from `config/tenant.ts`. Types already model `tenantId` on entities. A `TenantSwitcher` slot exists in the top bar (disabled placeholder).
- **i18n**: `useT()` returns the English dictionary today; switching to a real i18n lib later means replacing the hook implementation only.

## Out of scope (this iteration)

- Real authentication, Supabase, payments
- Drag-and-drop calendar grid (list view first; calendar grid can be added later)
- Create/edit forms wired to persistence (forms shown but submit is a no-op toast)
- Real charts beyond a couple of illustrative ones on the dashboard

## Technical notes

- TanStack Router file-based routes; each route file defines its own `head()` with route-specific title/description.
- `__root.tsx` wraps `<Outlet />` in `SidebarProvider` + sidebar + topbar; keeps existing `QueryClientProvider`.
- shadcn `Sidebar` with `collapsible="icon"`, active route highlighted via `useRouterState`.
- Charts via `recharts` (already in shadcn `chart.tsx`).
- No new heavy deps beyond what's already in the template.

## Deliverable

A polished, navigable SaaS app with realistic mock data across all six screens, organized exactly per the structure above, ready to commit and evolve.
