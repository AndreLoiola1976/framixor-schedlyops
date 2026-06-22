import { describe, it, expect } from "vitest";
import { deriveClients, searchClients } from "@/lib/derive-clients";
import type { Appointment } from "@/types/appointment";

function appt(over: Partial<Appointment>): Appointment {
  return {
    id: "a",
    tenantId: "t",
    clientId: "",
    professionalId: "p1",
    serviceId: "s1",
    startISO: "2026-01-01T10:00:00Z",
    endISO: "2026-01-01T10:30:00Z",
    status: "confirmed",
    priceCents: 1000,
    customerName: "Alice",
    customerPhone: "+1 555 111 2222",
    ...over,
  };
}

describe("deriveClients", () => {
  it("groups multiple bookings by normalized phone", () => {
    const out = deriveClients([
      appt({ id: "1", customerPhone: "+1 (555) 111-2222" }),
      appt({ id: "2", customerPhone: "+1 555 111 2222" }),
      appt({ id: "3", customerPhone: "+1 555 999 0000", customerName: "Bob" }),
    ]);
    expect(out).toHaveLength(2);
    const alice = out.find((c) => c.name === "Alice")!;
    expect(alice.totalBookings).toBe(2);
  });

  it("falls back to name when phone is missing and does not merge with phoned rows", () => {
    const out = deriveClients([
      appt({ id: "1", customerPhone: null, customerName: "Carol" }),
      appt({ id: "2", customerPhone: null, customerName: "carol" }),
      appt({ id: "3", customerPhone: "+1 555 000 0001", customerName: "Carol" }),
    ]);
    expect(out).toHaveLength(2);
    const byName = out.find((c) => c.id === "name:carol")!;
    expect(byName.totalBookings).toBe(2);
    expect(byName.groupedByName).toBe(true);
  });

  it("excludes block rows and rows with no name and no phone", () => {
    const out = deriveClients([
      appt({ id: "1", type: "block", customerName: null, customerPhone: null }),
      appt({ id: "2", customerName: null, customerPhone: null }),
      appt({ id: "3" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].totalBookings).toBe(1);
  });

  it("computes next / last / completed / cancelled / no-show separately", () => {
    const now = new Date("2026-06-01T12:00:00Z");
    const out = deriveClients(
      [
        appt({ id: "past1", startISO: "2026-05-01T10:00:00Z", status: "completed" }),
        appt({ id: "past2", startISO: "2026-05-10T10:00:00Z", status: "cancelled" }),
        appt({ id: "past3", startISO: "2026-05-15T10:00:00Z", status: "no_show" }),
        appt({ id: "future1", startISO: "2026-06-10T10:00:00Z", status: "confirmed" }),
        appt({ id: "future2", startISO: "2026-06-20T10:00:00Z", status: "cancelled" }),
      ],
      now,
    );
    expect(out).toHaveLength(1);
    const c = out[0];
    expect(c.totalBookings).toBe(5);
    expect(c.completedCount).toBe(1);
    expect(c.cancelledCount).toBe(2);
    expect(c.noShowCount).toBe(1);
    expect(c.nextAppointment?.id).toBe("future1");
    expect(c.lastAppointment?.id).toBe("past3");
    // history newest-first
    expect(c.bookings[0].id).toBe("future2");
  });
});

describe("searchClients", () => {
  const clients = deriveClients([
    appt({ id: "1", customerName: "Alice Smith", customerPhone: "+1 555 111 2222" }),
    appt({ id: "2", customerName: "Bob Jones", customerPhone: "+1 555 999 0000" }),
  ]);

  it("matches by partial name", () => {
    expect(searchClients(clients, "ali")).toHaveLength(1);
  });

  it("matches by partial phone digits ignoring formatting", () => {
    expect(searchClients(clients, "(555) 999")).toHaveLength(1);
  });

  it("returns all when query is blank", () => {
    expect(searchClients(clients, "  ")).toHaveLength(2);
  });
});
