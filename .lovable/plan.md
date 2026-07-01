
## Goal

Public booking (`/book/:tenantSlug`) UI copy is English, but weekday/month labels currently follow the browser locale (e.g. "qui., 2 de jul." on pt-BR). Lock all visible date/time formatting in the public booking flow to `en-US` while preserving tenant timezone behavior.

## Scope

Frontend / presentation only. No RPC, no backend, no new features, no UI redesign, no manage/cancel links, no auth. `src/features/public-booking/lib/dayStrip.ts` already hardcodes `en-US`.

## Changes

1. `src/features/public-booking/lib/locale.ts` (new)
   - Export `PUBLIC_BOOKING_LOCALE = "en-US"` as the single source of truth for public booking display formatting.

2. `src/features/public-booking/components/PublicBookingPage.tsx`
   - Import `PUBLIC_BOOKING_LOCALE`.
   - Replace `new Intl.DateTimeFormat(undefined, …)` in three places, preserving the existing `timeZone` option:
     - `formatSlotTime` — slot pills / success time. Yields "6:00 PM".
     - `weekdayLong`.
     - Success screen `dateLabel` — keeps `{ weekday: "short", month: "short", day: "numeric" }` → "Thu, Jul 2".
   - `format(date, "PPP")` from date-fns already renders in English (no `locale` passed); untouched.

## Non-goals / left untouched

Short Ref, "Call shop" gating on `publicPhone`, "Add to calendar", "Book another", `.ics` generation, address/maps, operator panel formatting, `dayStrip.ts`.

## Verification

- `bun run test` stays green (existing `public-booking-ics` / `public-booking` tests do not depend on locale output).
- Manual: `/book/demo-barber` with `navigator.language = "pt-BR"` → English day strip, "6:00 PM" pills, "Thu, Jul 2" on success.
- Tenant timezone still respected; booking still creates and appears in operator panel.
