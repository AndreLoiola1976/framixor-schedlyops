/**
 * Single source of truth for locale used when formatting dates/times in the
 * public booking flow (`/book/:tenantSlug`).
 *
 * Public booking UI copy is English-only for now, so weekday/month labels must
 * not follow `navigator.language`. Tenant timezone is still respected — this
 * constant governs locale only, not timezone.
 */
export const PUBLIC_BOOKING_LOCALE = "en-US";
