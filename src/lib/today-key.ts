import { useEffect, useState } from "react";
import { dayKey } from "@/lib/format";

/**
 * Compute today's YYYY-MM-DD in the given timezone (IANA) when available,
 * falling back to the browser's local zone. Pure: same input → same output
 * for a given `now`. Safe to call on the server (returns a deterministic
 * value), but consumers that render `today` should still mount-gate to
 * avoid SSR/CSR hydration mismatches when the server clock or zone differs
 * from the client.
 */
export function computeTodayKey(timezone?: string, now: Date = new Date()): string {
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;
      if (y && m && d) return `${y}-${m}-${d}`;
    } catch {
      /* fall through */
    }
  }
  return dayKey(now.toISOString());
}

/**
 * Compute the YYYY-MM-DD day key for a given ISO instant in the supplied
 * IANA timezone. Falls back to the ISO's UTC date slice when no timezone is
 * provided or `Intl.DateTimeFormat` rejects it. Use for both "today" and
 * per-appointment day keys so the comparison is consistent.
 */
export function dayKeyInTz(iso: string, timezone?: string): string {
  return computeTodayKey(timezone, new Date(iso));
}

/**
 * Client-only today key — `null` on the server render and first client
 * render, then resolves after mount. Use this anywhere the rendered output
 * depends on "today" to avoid hydration mismatches.
 */
export function useTodayKey(timezone?: string): string | null {
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    setKey(computeTodayKey(timezone));
  }, [timezone]);
  return key;
}
