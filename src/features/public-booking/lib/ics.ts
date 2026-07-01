/**
 * Minimal RFC 5545 .ics builder for the public booking success screen.
 * Pure functions only — no DOM, no fetch. Safe to unit-test.
 */

export interface IcsInput {
  uid: string;
  startsAt: string; // ISO
  durationMinutes: number; // fallback handled by caller if unknown
  summary: string;
  location?: string | null;
  description?: string | null;
}

/** Escape a text value per RFC 5545 §3.3.11. */
export function escapeIcsText(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** UTC timestamp in `YYYYMMDDTHHMMSSZ` form. */
export function toIcsUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/**
 * Build an RFC 5545 VCALENDAR string. Uses CRLF line endings.
 * Omits LOCATION and DESCRIPTION when the caller passes empty values.
 */
export function buildIcs(input: IcsInput): string {
  const dtStart = toIcsUtc(input.startsAt);
  const durMin = input.durationMinutes > 0 ? input.durationMinutes : 30;
  const endIso = new Date(new Date(input.startsAt).getTime() + durMin * 60_000).toISOString();
  const dtEnd = toIcsUtc(endIso);
  const dtStamp = toIcsUtc(new Date().toISOString());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SchedlyOps//Public Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(input.uid)}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(input.summary)}`,
  ];
  const loc = input.location?.trim();
  if (loc) lines.push(`LOCATION:${escapeIcsText(loc)}`);
  const desc = input.description?.trim();
  if (desc) lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/** Join address parts into a single comma-separated line, filtering empties. */
export function formatAddress(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 0)
    .join(", ");
}

/** Google Maps directions URL for a destination address. Returns null when empty. */
export function buildMapsUrl(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trimmed)}`;
}

/**
 * Browser-only: trigger a download of the given .ics text as a file.
 * Revokes the object URL on the next tick. No-ops in non-DOM environments.
 */
export function downloadIcs(icsText: string, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on next tick so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
