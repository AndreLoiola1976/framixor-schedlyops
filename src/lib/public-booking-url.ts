/**
 * Build the public booking page URL for a tenant slug.
 *
 * Uses `VITE_PUBLIC_BOOKING_BASE_URL` when defined (e.g. the deployed
 * storefront host like `https://demo-barber.lovable.app`). Falls back to the
 * current window origin for local dev so links remain clickable, and to an
 * empty string during SSR when no env override is set.
 */
export function getPublicBookingBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_PUBLIC_BOOKING_BASE_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "";
}

export function getPublicBookingUrl(slug: string | null | undefined): string {
  const s = (slug ?? "").trim();
  if (!s) return "";
  const base = getPublicBookingBaseUrl();
  return `${base}/book/${encodeURIComponent(s)}`;
}
