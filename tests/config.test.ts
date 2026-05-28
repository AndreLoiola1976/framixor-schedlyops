import { describe, it, expect } from "vitest";
import { services } from "@/config/services";
import { professionals } from "@/config/professionals";
import { clients } from "@/config/clients";
import { appointments } from "@/config/appointments";
import { navigation } from "@/config/navigation";
import { allStatuses } from "@/config/statuses";

function uniqueIds<T extends { id: string }>(rows: T[]): boolean {
  return new Set(rows.map((r) => r.id)).size === rows.length;
}

describe("config integrity", () => {
  it("services have unique ids and valid numbers", () => {
    expect(uniqueIds(services)).toBe(true);
    for (const s of services) {
      expect(s.priceCents).toBeGreaterThan(0);
      expect(s.durationMinutes).toBeGreaterThan(0);
    }
  });

  it("service.professionalIds reference real professionals", () => {
    const proIds = new Set(professionals.map((p) => p.id));
    for (const s of services) {
      for (const pid of s.professionalIds) {
        expect(proIds.has(pid), `unknown professional ${pid} in service ${s.id}`).toBe(true);
      }
    }
  });

  it("professionals and clients have unique ids", () => {
    expect(uniqueIds(professionals)).toBe(true);
    expect(uniqueIds(clients)).toBe(true);
  });

  it("appointments have unique ids and valid references", () => {
    expect(uniqueIds(appointments)).toBe(true);
    const proIds = new Set(professionals.map((p) => p.id));
    const cliIds = new Set(clients.map((c) => c.id));
    const svcIds = new Set(services.map((s) => s.id));
    const statusSet = new Set<string>(allStatuses);
    for (const a of appointments) {
      expect(proIds.has(a.professionalId), `unknown pro ${a.professionalId}`).toBe(true);
      expect(cliIds.has(a.clientId), `unknown client ${a.clientId}`).toBe(true);
      expect(svcIds.has(a.serviceId), `unknown service ${a.serviceId}`).toBe(true);
      expect(statusSet.has(a.status), `unknown status ${a.status}`).toBe(true);
    }
  });

  it("navigation entries have unique absolute paths", () => {
    const tos = navigation.flatMap((s) => s.items.map((i) => i.to));
    expect(new Set(tos).size).toBe(tos.length);
    for (const to of tos) expect(to.startsWith("/")).toBe(true);
  });
});
