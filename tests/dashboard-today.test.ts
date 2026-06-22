import { describe, it, expect } from "vitest";
import { computeTodayKey } from "@/lib/today-key";
import { deriveDashboardToday } from "@/lib/dashboard-today";
import type { Appointment } from "@/types/appointment";
import type { Professional } from "@/types/professional";

function appt(over: Partial<Appointment>): Appointment {
  return {
    id: "a",
    tenantId: "t",
    clientId: "c",
    professionalId: "p1",
    serviceId: "s1",
    startISO: "2026-06-22T14:00:00Z",
    endISO: "2026-06-22T14:30:00Z",
    status: "confirmed",
    priceCents: 2500,
    customerName: "Alice",
    customerPhone: "+1 555 111 2222",
    ...over,
  };
}

function pro(over: Partial<Professional>): Professional {
  return {
    id: "p1",
    tenantId: "t",
    name: "Pat",
    role: "barber",
    email: "",
    phone: "",
    initials: "PA",
    specialties: [],
    workingDays: "",
    workingHours: "",
    active: true,
    ...over,
  };
}

describe("computeTodayKey", () => {
  it("returns YYYY-MM-DD in America/New_York for a UTC time that is the previous day in NY", () => {
    // 2026-06-23T02:00:00Z = 2026-06-22 22:00 EDT
    const now = new Date("2026-06-23T02:00:00Z");
    expect(computeTodayKey("America/New_York", now)).toBe("2026-06-22");
  });

  it("returns YYYY-MM-DD in America/New_York for a UTC time that is the same day in NY", () => {
    const now = new Date("2026-06-22T18:00:00Z"); // 14:00 EDT
    expect(computeTodayKey("America/New_York", now)).toBe("2026-06-22");
  });

  it("falls back to UTC date slice when timezone is missing", () => {
    const now = new Date("2026-06-22T23:30:00Z");
    expect(computeTodayKey(undefined, now)).toBe("2026-06-22");
  });

  it("falls back to UTC date slice when timezone is invalid", () => {
    const now = new Date("2026-06-22T10:00:00Z");
    expect(computeTodayKey("Not/AZone", now)).toBe("2026-06-22");
  });
});

describe("deriveDashboardToday", () => {
  const pros = [pro({ id: "p1", name: "Pat" }), pro({ id: "p2", name: "Sam" })];
  const inactive = pro({ id: "p3", name: "Gone", active: false });
  const today = "2026-06-22";
  const now = new Date("2026-06-22T13:30:00Z");

  it("filters by today key, sorts by startISO, and excludes blocks from customer stats", () => {
    const list: Appointment[] = [
      appt({ id: "x", startISO: "2026-06-21T14:00:00Z" }), // yesterday
      appt({ id: "1", startISO: "2026-06-22T15:00:00Z", status: "confirmed" }),
      appt({ id: "2", startISO: "2026-06-22T11:00:00Z", status: "completed" }),
      appt({ id: "b", startISO: "2026-06-22T12:00:00Z", type: "block" }),
      appt({ id: "3", startISO: "2026-06-22T18:00:00Z", status: "cancelled" }),
      appt({ id: "4", startISO: "2026-06-22T19:00:00Z", status: "no_show" }),
    ];
    const out = deriveDashboardToday(list, today, [...pros, inactive], now);
    expect(out.todayAppointments.map((a) => a.id)).toEqual(["2", "b", "1", "3", "4"]);
    expect(out.customerAppointments.map((a) => a.id)).toEqual(["2", "1", "3", "4"]);
    expect(out.counts).toEqual({ total: 4, completed: 1, cancelled: 1, noShow: 1 });
  });

  it("picks the next actionable appointment (confirmed/pending only, future)", () => {
    const list: Appointment[] = [
      appt({ id: "past", startISO: "2026-06-22T10:00:00Z", status: "completed" }),
      appt({ id: "cancelled", startISO: "2026-06-22T14:00:00Z", status: "cancelled" }),
      appt({ id: "next", startISO: "2026-06-22T15:00:00Z", status: "confirmed" }),
      appt({ id: "later", startISO: "2026-06-22T17:00:00Z", status: "pending" }),
    ];
    const out = deriveDashboardToday(list, today, pros, now);
    expect(out.nextAppointment?.id).toBe("next");
  });

  it("returns null next appointment when only blocked/cancelled/completed remain", () => {
    const list: Appointment[] = [
      appt({ id: "1", startISO: "2026-06-22T15:00:00Z", status: "cancelled" }),
      appt({ id: "b", startISO: "2026-06-22T16:00:00Z", type: "block" }),
      appt({ id: "2", startISO: "2026-06-22T17:00:00Z", status: "completed" }),
    ];
    const out = deriveDashboardToday(list, today, pros, now);
    expect(out.nextAppointment).toBeNull();
  });

  it("computes estimated revenue from completed customer appointments only", () => {
    const list: Appointment[] = [
      appt({ id: "1", status: "completed", priceCents: 3000 }),
      appt({ id: "2", status: "completed", priceCents: 1500 }),
      appt({ id: "3", status: "confirmed", priceCents: 9999 }), // not counted
      appt({ id: "b", type: "block", priceCents: 8888 }), // not counted
    ];
    const out = deriveDashboardToday(list, today, pros, now);
    expect(out.estimatedRevenueCents).toBe(4500);
  });

  it("groups today's appointments by active professional and emits empty buckets", () => {
    const list: Appointment[] = [
      appt({ id: "1", professionalId: "p1" }),
      appt({ id: "2", professionalId: "p1", startISO: "2026-06-22T16:00:00Z" }),
      appt({ id: "3", professionalId: "p3" }), // inactive — dropped from buckets
    ];
    const out = deriveDashboardToday(list, today, [...pros, inactive], now);
    expect(out.byProfessional.map((b) => b.professionalId)).toEqual(["p1", "p2"]);
    expect(out.byProfessional[0].items.map((a) => a.id)).toEqual(["1", "2"]);
    expect(out.byProfessional[1].items).toEqual([]);
  });
});
