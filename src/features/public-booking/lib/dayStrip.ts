/**
 * Build the next N calendar days starting at `from`, expressed in the tenant's
 * timezone. Returns hydration-safe display labels alongside the canonical
 * YYYY-MM-DD key used by `usePublicSlots`.
 *
 * Presentation-only helper: no business logic, no network. Pure function so it
 * can be unit-tested and called from a `useEffect` to keep server/client
 * markup aligned.
 */
export interface DayCell {
  /** YYYY-MM-DD in the target timezone. */
  key: string;
  /** Short weekday label, e.g. "WED". */
  weekday: string;
  /** Day-of-month label, e.g. "24". */
  day: string;
}

function parts(d: Date, timeZone: string | undefined) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const out: Record<string, string> = {};
  for (const p of fmt.formatToParts(d)) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return out;
}

export function buildDayStrip(
  from: Date,
  count: number,
  timeZone: string | null | undefined,
): DayCell[] {
  const tz = timeZone || undefined;
  const cells: DayCell[] = [];
  const oneDay = 24 * 60 * 60 * 1000;
  // Anchor on UTC midnight of `from` to avoid DST drift accumulating across
  // the strip — the timezone-aware formatter handles local-day display.
  const base = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 12, 0, 0),
  );
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime() + i * oneDay);
    const p = parts(d, tz);
    cells.push({
      key: `${p.year}-${p.month}-${p.day}`,
      weekday: (p.weekday || "").toUpperCase(),
      day: p.day || "",
    });
  }
  return cells;
}
