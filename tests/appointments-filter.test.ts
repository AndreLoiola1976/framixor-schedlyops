import { describe, it, expect } from "vitest";
import { filterAppointments } from "@/lib/appointments-filter";
import type { Appointment } from "@/types/appointment";
import type { Service } from "@/types/service";
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
    customerName: "Alice Brown",
    customerPhone: "+1 (555) 111-2222",
    ...over,
  };
}

const services: Record<string, Service> = {
  s1: {
    id: "s1",
    tenantId: "t",
    name: "Classic Haircut",
    description: "",
    category: "",
    durationMinutes: 30,
    priceCents: 2500,
    active: true,
    professionalIds: [],
  },
  s2: {
    id: "s2",
    tenantId: "t",
    name: "Beard Trim",
    description: "",
    category: "",
    durationMinutes: 15,
    priceCents: 1500,
    active: true,
    professionalIds: [],
  },
};
const pros: Record<string, Professional> = {
  p1: {
    id: "p1",
    tenantId: "t",
    name: "Pat",
    role: "",
    email: "",
    phone: "",
    initials: "PA",
    specialties: [],
    workingDays: "",
    workingHours: "",
    active: true,
  },
  p2: {
    id: "p2",
    tenantId: "t",
    name: "Sam",
    role: "",
    email: "",
    phone: "",
    initials: "SA",
    specialties: [],
    workingDays: "",
    workingHours: "",
    active: true,
  },
};

const baseInput = {
  professionalId: "all" as const,
  search: "",
  todayKey: "2026-06-22",
  nowISO: "2026-06-22T13:00:00Z",
  timezone: "UTC",
  serviceMap: services,
  professionalMap: pros,
};

describe("filterAppointments", () => {
  it("today: matches only today's rows; includes blocks today", () => {
    const all = [
      appt({ id: "1" }),
      appt({ id: "y", startISO: "2026-06-21T14:00:00Z" }),
      appt({ id: "b", type: "block" }),
    ];
    const out = filterAppointments(all, { ...baseInput, quick: "today" });
    expect(out.map((a) => a.id).sort()).toEqual(["1", "b"]);
  });

  it("today: uses tenant timezone for the appointment day key (America/New_York edge)", () => {
    // 2026-06-22T02:00:00Z = 2026-06-21 22:00 EDT — belongs to "yesterday" in NY.
    // 2026-06-22T16:00:00Z = 2026-06-22 12:00 EDT — belongs to today in NY.
    const all = [
      appt({ id: "ny-prev", startISO: "2026-06-22T02:00:00Z" }),
      appt({ id: "ny-today", startISO: "2026-06-22T16:00:00Z" }),
    ];
    const out = filterAppointments(all, {
      ...baseInput,
      quick: "today",
      timezone: "America/New_York",
      todayKey: "2026-06-22",
    });
    expect(out.map((a) => a.id)).toEqual(["ny-today"]);
  });

  it("upcoming: excludes past, cancelled, no_show, completed; includes future blocks", () => {
    const all = [
      appt({ id: "past", startISO: "2026-06-22T10:00:00Z" }),
      appt({ id: "ok", startISO: "2026-06-22T15:00:00Z", status: "confirmed" }),
      appt({ id: "cx", startISO: "2026-06-22T16:00:00Z", status: "cancelled" }),
      appt({ id: "ns", startISO: "2026-06-22T17:00:00Z", status: "no_show" }),
      appt({ id: "done", startISO: "2026-06-22T18:00:00Z", status: "completed" }),
      appt({ id: "block-future", startISO: "2026-06-22T20:00:00Z", type: "block" }),
      appt({ id: "block-past", startISO: "2026-06-22T10:00:00Z", type: "block" }),
    ];
    const out = filterAppointments(all, { ...baseInput, quick: "upcoming" });
    expect(out.map((a) => a.id).sort()).toEqual(["block-future", "ok"]);
  });

  it("status filters return only matching status and exclude blocks", () => {
    const all = [
      appt({ id: "1", status: "completed" }),
      appt({ id: "2", status: "confirmed" }),
      appt({ id: "b", status: "completed", type: "block" }),
    ];
    const out = filterAppointments(all, { ...baseInput, quick: "completed" });
    expect(out.map((a) => a.id)).toEqual(["1"]);
  });

  it("search: matches name, phone digits, service name, professional name", () => {
    const all = [
      appt({ id: "name", customerName: "Charlie" }),
      appt({ id: "phone", customerName: "Z", customerPhone: "+44 7000 999888" }),
      appt({ id: "svc", customerName: "Z", serviceId: "s2" }),
      appt({ id: "pro", customerName: "Z", professionalId: "p2" }),
      appt({ id: "miss", customerName: "Z" }),
    ];
    expect(
      filterAppointments(all, { ...baseInput, quick: "all", search: "charlie" }).map((a) => a.id),
    ).toEqual(["name"]);
    expect(
      filterAppointments(all, { ...baseInput, quick: "all", search: "7000999" }).map((a) => a.id),
    ).toEqual(["phone"]);
    expect(
      filterAppointments(all, { ...baseInput, quick: "all", search: "beard" }).map((a) => a.id),
    ).toEqual(["svc"]);
    expect(
      filterAppointments(all, { ...baseInput, quick: "all", search: "sam" }).map((a) => a.id),
    ).toEqual(["pro"]);
  });

  it("search excludes blocks", () => {
    const all = [appt({ id: "b", type: "block", customerName: null })];
    const out = filterAppointments(all, { ...baseInput, quick: "all", search: "any" });
    expect(out).toEqual([]);
  });

  it("professional filter combines with quick filter", () => {
    const all = [appt({ id: "1", professionalId: "p1" }), appt({ id: "2", professionalId: "p2" })];
    const out = filterAppointments(all, { ...baseInput, quick: "today", professionalId: "p2" });
    expect(out.map((a) => a.id)).toEqual(["2"]);
  });
});
