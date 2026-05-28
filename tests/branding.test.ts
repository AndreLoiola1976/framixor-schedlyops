import { describe, it, expect } from "vitest";
import { activeTenant } from "@/config/tenant";

describe("tenant branding", () => {
  it("activeTenant has branding with all required fields", () => {
    const b = activeTenant.branding;
    expect(b).toBeDefined();
    if (!b) return;
    for (const key of [
      "name",
      "logoInitials",
      "primary",
      "secondary",
      "background",
      "foreground",
    ] as const) {
      expect(typeof b[key], `${key} should be a string`).toBe("string");
      expect(b[key].length, `${key} should be non-empty`).toBeGreaterThan(0);
    }
  });

  it("branding color fields are CSS oklch() values", () => {
    const b = activeTenant.branding!;
    for (const key of ["primary", "secondary", "background", "foreground"] as const) {
      expect(b[key].startsWith("oklch("), `${key} should be oklch()`).toBe(true);
    }
  });
});
