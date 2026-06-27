# SchedlyOps — Founder Beta Readiness Review

Status: **decision document, not an approved plan.** No recommendation in
this file is approved for implementation. Do not change product code in
response to this review without an explicit approval pass from the user.

Purpose: honest, impartial product + technical read on what's weak,
missing, overbuilt, or risky before showing SchedlyOps to a real
barbershop in a small Founder Beta (1–2 shops).

---

## TL;DR

You have a credible **operator panel + a beautiful public booking page**,
but the product is **not yet trustworthy for a real shop's daily revenue**.
The visual direction is ahead of the operational substance. Three things
stand between you and a usable Founder Beta:

1. **No production public host** (`VITE_PUBLIC_BOOKING_BASE_URL` unset).
2. **Per-professional working hours is the silent backbone and barely surfaced.**
3. **No customer-facing notification loop** (confirmation email, manage/cancel
   link, reminders) — the #1 reason barbershops adopt scheduling software at all.

**Strongest reason to choose SchedlyOps today:** the public booking page
looks better than 95% of Booksy/Square pages — it feels like the shop has
a real brand.

**Weakest part:** zero customer communication loop. A booking the customer
can't find again later is worse than a WhatsApp DM.

---

## 1. Public booking customer experience

**Strong**
- Sand & Brass theme + device frame is genuinely premium and differentiates from Booksy's generic look.
- Slot fetching uses a real backend RPC (`public_available_slots`) — not fake.
- Idempotency key + Edge Function wrapper for booking creation is more robust than most v1 products.
- Preselection via `?service=&professional=` is a real growth lever.

**Weak / Missing**
- **No rich confirmation screen.** Customer needs: date/time in their TZ, address, "add to calendar" (.ics), manage/cancel link visible and copyable.
- **No reminder system.** Email/SMS reminder 24h + 2h before is table stakes.
- **No customer-visible cancel/reschedule.** `manage_token` exists backend-side but no `/manage/:token` route.
- **No "returning customer" path.** Phone-number lookup that prefills name would reduce friction.
- **noindex on public page.** Right call short-term; means zero organic discovery.
- **No timezone confirmation.** Slots render in browser TZ; silent mismatches possible.

**Challenge: Is the public page good enough to replace a basic barbershop website link?**
Visually yes. Functionally **no, until confirmation + reminders exist.**

## 2. Operator / barber owner workflow

**Strong**
- Dashboard "today command center" is the right shape.
- Settings is organized and not overwhelming.
- Sidebar nav is conventional and learnable in 30 seconds.

**Weak / Missing**
- **No mobile-optimized walk-in / quick-add.** Owner is rarely at a laptop.
- **No customer notes** ("prefers fade #2", "allergic to X"). Clients page is read-only.
- **No revenue truth.** KPI deltas are 0; revenue chart only renders in mock mode. Owner sees zeros, loses trust.
- **No "block time" creation UX** visible (blocks exist in data model).
- **Waitlist deferred** (correct call for MVP).

## 3. Appointment management

**Strong**
- Filters + search + mobile cards are well-executed.
- Lifecycle (complete / cancel / no-show) wired through real RPCs with past-only gating.
- Reschedule via dedicated RPC.

**Weak / Missing**
- **No calendar-grid / day view.** Lists work for 5 appointments, painful for 25.
- **No drag-to-reschedule.** Owners expect Google-Calendar muscle memory.
- **No bulk actions / CSV export** (deferred — keep deferred).
- **No print day-sheet.**

## 4. Services / professionals / working hours

**Strong**
- Services CRUD with active toggle (recent fix) is solid.
- Per-professional working hours is the **correct** data model.

**Weak / Missing — most under-surfaced critical area**
- **Working hours UX is hidden** inside a Professional dialog. New owners don't realize they have to set hours per pro, will see "no availability" and blame the booking page.
- **No "copy hours from another pro" / "set all pros to shop default"** — guaranteed day-1 frustration.
- **No service ↔ professional eligibility matrix.** In real barbershops, apprentices don't do straight-razor shaves.
- **No buffer time per service** (cleanup between cuts).

## 5. Settings & Launch Kit

**Strong**
- Launch Kit readiness checklist is genuinely good owner-onboarding UX.
- Share snippets for IG / WhatsApp / Google Business are clever and channel-specific.

**Weak / Risky**
- **Booking link is unsafe to share** (preview-host fallback prompts Lovable login). Documented — good — but until `VITE_PUBLIC_BOOKING_BASE_URL` is set in production, the Launch Kit's value prop is broken.
- **No QR code yet.** Highest-leverage Launch Kit add-on for physical signage.
- **Working-hours item is muted/"coming soon"** but it's the #1 thing that breaks bookings.

**Challenge: Is the Launch Kit useful or nice-to-have?**
Useful — but only *after* the link is shareable and *after* a QR code exists.

## 6. Visual trust / premium positioning

**Strong**
- Sand & Brass is a real differentiator.
- Operator panel has restrained, professional chrome.

**Risk**
- **Polish is currently ahead of substance.** Premium look turns into "expensive thing that doesn't work" when reminders / confirmations are missing.
- **No per-tenant theming** despite the `tenant.theme_preset` TODO. Premium positioning implies "*my* shop's page", not "SchedlyOps".

**Challenge: Is visual polish more important than operational reliability right now?**
No. **Reverse the priority for the next 2–4 weeks.**

## 7. Technical risks / fragile areas

**Acknowledged in repo**
- Free-text timezone input — typos break scheduling and today-key.
- Mock fallback hiding real-tenant gaps (already neutralized).
- Public booking base URL fallback — documented constraint.

**Not yet acknowledged**
- **Hydration mismatch in AuthGate** (visible in current runtime errors — server rendered operator shell while client rendered loading state). Intermittent wrong-UI flash on every page load.
- **No error monitoring** (Sentry / equivalent). Beta = errors you don't reproduce locally.
- **No analytics on the public funnel.** Won't know where customers drop.
- **Edge Function `public-create-booking` retry UX** — confirm idempotency key replays on user retry after 5xx.
- **`useDerivedClients` is client-side.** Fine at 1k appointments, slow at 10k.
- **Tests are good (75+) but mostly pure-logic.** No E2E covering operator→public integration.

## 8. Founder Beta readiness

**Blockers (must fix before first real shop):**
1. Set `VITE_PUBLIC_BOOKING_BASE_URL` to a verified public production host.
2. Customer confirmation email with date/time/address/manage-link.
3. Customer-facing cancel/reschedule via `manage_token`.
4. Working-hours onboarding moment (Settings nudge or guided step).
5. Dashboard revenue/KPIs honest (ship real numbers or hide deltas).
6. Fix AuthGate hydration mismatch.

**Should fix before first real shop:**
- Reminder email (24h + 2h before).
- QR code in Launch Kit.
- Service ↔ professional eligibility (or explicit "every pro does every service" acknowledgement in onboarding).
- Mobile-optimized Create Booking dialog.
- Error monitoring + public funnel analytics.
- E2E test: operator-created booking removes slot from public page.

**Can wait:**
- Waitlist / walk-in queue.
- Per-tenant theme presets.
- Drag-to-reschedule calendar grid.
- Buffer time per service.
- Client notes / CRM fields.
- CSV export, bulk actions, print day-sheet.

**Nice later:**
- Multi-location.
- Loyalty / package deals.
- Stripe deposits / no-show fee capture.
- Google Calendar two-way sync.
- Marketing automation.

## 9. Competitive adoption risk

**Real competitors for a small barbershop:**
- **WhatsApp / Instagram DM** — free, zero learning curve. The real competitor, not Booksy.
- **Google Calendar + paper.**
- **Booksy** — ugly but ubiquitous; customers already have the app.
- **Square Appointments** — bundled with POS.
- **Fresha** — free for the business, strong in beauty.

**What would actually make a barber switch:**
1. A link they're proud to put in their Instagram bio. ← Closest to winning here.
2. No-shows go down measurably (reminders + deposits).
3. Setup in <10 minutes.
4. Free or near-free until they make money from it.
5. No risk of losing existing customers' bookings.

**Do NOT build right now:**
- Multi-location, multi-currency.
- Native mobile app.
- AI features.
- Marketing / email campaigns.
- Payment processing beyond a simple deposit hold.
- Non-barbershop verticals.

**Highest-leverage next feature after current work:**
**Customer notification loop = confirmation email + 24h reminder + manage/cancel link.**
This single capability transitions SchedlyOps from "pretty booking page"
to "tool that reduces no-shows" — the only ROI a barbershop cares about.

---

## Suggested 2–4 week sequence (not approved)

1. Set production `VITE_PUBLIC_BOOKING_BASE_URL` + verify share flow on a real phone.
2. Confirmation email with manage link.
3. `/manage/:token` page for customer cancel/reschedule.
4. 24h reminder cron — email first, SMS later.
5. Honest dashboard KPI deltas (or hide).
6. Working-hours onboarding nudge + "copy hours" action.
7. Fix AuthGate hydration; add Sentry or equivalent.
8. QR code in Launch Kit.
9. One real E2E test of the booking funnel.
10. **Then** invite shop #1.

---

**Reminder:** this document is a decision aid. Nothing here is scheduled
or approved. Implementation requires a separate approval pass per item.
