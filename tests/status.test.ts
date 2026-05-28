import { describe, it, expect } from "vitest";
import { statusDefinitions, allStatuses } from "@/config/statuses";
import { appointments } from "@/config/appointments";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";

describe("status integrity", () => {
  it("every status key has en and es translations", () => {
    for (const key of Object.keys(statusDefinitions)) {
      expect((en.status as Record<string, string>)[key]?.length).toBeGreaterThan(0);
      expect((es.status as Record<string, string>)[key]?.length).toBeGreaterThan(0);
    }
  });

  it("every appointment.status is a known status", () => {
    const known = new Set<string>(allStatuses);
    for (const a of appointments) expect(known.has(a.status)).toBe(true);
  });
});
