import type { Appointment, AppointmentStatus } from "@/types/appointment";

export interface DerivedClientBooking {
  id: string;
  startISO: string;
  endISO: string;
  status: AppointmentStatus;
  serviceId: string;
  professionalId: string;
  priceCents: number;
}

export interface DerivedClient {
  /** Stable per-group key: "phone:<digits>" or "name:<normalized>". */
  id: string;
  name: string;
  phone: string;
  /** True when grouping fell back to name because phone was missing. */
  groupedByName: boolean;
  initials: string;
  totalBookings: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  nextAppointment: DerivedClientBooking | null;
  lastAppointment: DerivedClientBooking | null;
  favoriteProfessionalId: string | null;
  favoriteServiceId: string | null;
  bookings: DerivedClientBooking[];
}

function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.replace(/\D+/g, "");
}

function normalizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mode<T extends string>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const it of items) counts.set(it, (counts.get(it) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = -1;
  for (const [k, v] of counts) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best;
}

const TERMINAL_NOT_BOOKED: AppointmentStatus[] = ["cancelled", "no_show"];

/**
 * Group bookings into derived clients.
 *
 * - Excludes `type === "block"` (working-hour blocks are not customer bookings).
 * - Excludes rows with neither customerPhone nor customerName.
 * - Groups primarily by normalized phone (digits only). Falls back to
 *   normalized customer name when phone is missing — two phoneless rows
 *   with the same name collapse, but a phoneless row never collapses with
 *   a phoned one.
 * - next/last is based on the absolute booking instant (`startISO`), so
 *   "now" comparison is timezone-independent. The tenant timezone only
 *   matters for display formatting, handled at the UI layer.
 */
export function deriveClients(
  appointments: Appointment[],
  now: Date = new Date(),
): DerivedClient[] {
  const groups = new Map<
    string,
    {
      id: string;
      name: string;
      phone: string;
      groupedByName: boolean;
      mostRecentNameAt: number;
      bookings: DerivedClientBooking[];
    }
  >();

  for (const a of appointments) {
    if (a.type === "block") continue;
    const phoneDigits = normalizePhone(a.customerPhone);
    const nameKey = normalizeName(a.customerName);
    if (!phoneDigits && !nameKey) continue;

    const groupedByName = !phoneDigits;
    const id = groupedByName ? `name:${nameKey}` : `phone:${phoneDigits}`;
    const displayName = (a.customerName ?? "").trim() || a.customerPhone || "Unknown";
    const displayPhone = (a.customerPhone ?? "").trim();
    const startedAt = new Date(a.startISO).getTime();

    let g = groups.get(id);
    if (!g) {
      g = {
        id,
        name: displayName,
        phone: displayPhone,
        groupedByName,
        mostRecentNameAt: startedAt,
        bookings: [],
      };
      groups.set(id, g);
    } else {
      // Prefer the most recent non-empty name; keep first non-empty phone.
      if (displayName && startedAt >= g.mostRecentNameAt) {
        g.name = displayName;
        g.mostRecentNameAt = startedAt;
      }
      if (!g.phone && displayPhone) g.phone = displayPhone;
    }

    g.bookings.push({
      id: a.id,
      startISO: a.startISO,
      endISO: a.endISO,
      status: a.status,
      serviceId: a.serviceId,
      professionalId: a.professionalId,
      priceCents: a.priceCents,
    });
  }

  const nowMs = now.getTime();
  const derived: DerivedClient[] = [];

  for (const g of groups.values()) {
    // Sort newest-first for the history view.
    g.bookings.sort((a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime());

    let completedCount = 0;
    let cancelledCount = 0;
    let noShowCount = 0;
    for (const b of g.bookings) {
      if (b.status === "completed") completedCount++;
      else if (b.status === "cancelled") cancelledCount++;
      else if (b.status === "no_show") noShowCount++;
    }

    // next = earliest future booking that isn't cancelled/no_show.
    const futureActive = g.bookings
      .filter(
        (b) => new Date(b.startISO).getTime() >= nowMs && !TERMINAL_NOT_BOOKED.includes(b.status),
      )
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
    const nextAppointment = futureActive[0] ?? null;

    // last = most recent booking strictly in the past (any status).
    const past = g.bookings.filter((b) => new Date(b.startISO).getTime() < nowMs);
    const lastAppointment = past[0] ?? null;

    derived.push({
      id: g.id,
      name: g.name,
      phone: g.phone,
      groupedByName: g.groupedByName,
      initials: computeInitials(g.name),
      totalBookings: g.bookings.length,
      completedCount,
      cancelledCount,
      noShowCount,
      nextAppointment,
      lastAppointment,
      favoriteProfessionalId: mode(g.bookings.map((b) => b.professionalId).filter(Boolean)),
      favoriteServiceId: mode(g.bookings.map((b) => b.serviceId).filter(Boolean)),
      bookings: g.bookings,
    });
  }

  // Sort: clients with an upcoming appt first (earliest next), then by most
  // recent past visit, then by name for stable display.
  derived.sort((a, b) => {
    const an = a.nextAppointment ? new Date(a.nextAppointment.startISO).getTime() : Infinity;
    const bn = b.nextAppointment ? new Date(b.nextAppointment.startISO).getTime() : Infinity;
    if (an !== bn) return an - bn;
    const al = a.lastAppointment ? new Date(a.lastAppointment.startISO).getTime() : -Infinity;
    const bl = b.lastAppointment ? new Date(b.lastAppointment.startISO).getTime() : -Infinity;
    if (al !== bl) return bl - al;
    return a.name.localeCompare(b.name);
  });

  return derived;
}

export function searchClients(clients: DerivedClient[], query: string): DerivedClient[] {
  const q = query.trim().toLowerCase();
  if (!q) return clients;
  const qDigits = q.replace(/\D+/g, "");
  return clients.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (qDigits && normalizePhone(c.phone).includes(qDigits)) return true;
    return false;
  });
}
