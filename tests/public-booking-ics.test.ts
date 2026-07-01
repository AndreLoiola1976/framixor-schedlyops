import { describe, it, expect } from "vitest";
import {
  buildIcs,
  escapeIcsText,
  toIcsUtc,
  formatAddress,
  buildMapsUrl,
} from "@/features/public-booking/lib/ics";

describe("escapeIcsText", () => {
  it("escapes commas, semicolons, backslashes and newlines", () => {
    expect(escapeIcsText("a, b; c\\d\ne")).toBe("a\\, b\\; c\\\\d\\ne");
  });
});

describe("toIcsUtc", () => {
  it("emits YYYYMMDDTHHMMSSZ in UTC", () => {
    expect(toIcsUtc("2026-07-02T18:30:00Z")).toBe("20260702T183000Z");
  });
  it("returns empty string on invalid input", () => {
    expect(toIcsUtc("not-a-date")).toBe("");
  });
});

describe("buildIcs", () => {
  it("produces a VCALENDAR with CRLF, UTC times, and UID", () => {
    const ics = buildIcs({
      uid: "abc-123@schedlyops",
      startsAt: "2026-07-02T18:30:00Z",
      durationMinutes: 40,
      summary: "Skin Fade @ Danbury Barber",
      location: "214 Main Street, Danbury, CT",
      description: "With Marco",
    });
    expect(ics).toContain("\r\n");
    expect(ics.split("\n").every((l) => l === "" || l.endsWith("\r"))).toBe(true);
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("END:VCALENDAR\r\n");
    expect(ics).toContain("UID:abc-123@schedlyops");
    expect(ics).toContain("DTSTART:20260702T183000Z");
    expect(ics).toContain("DTEND:20260702T191000Z");
    expect(ics).toContain("SUMMARY:Skin Fade @ Danbury Barber");
    expect(ics).toContain("LOCATION:214 Main Street\\, Danbury\\, CT");
    expect(ics).toContain("DESCRIPTION:With Marco");
  });

  it("falls back to 30 minutes when duration is 0 or missing", () => {
    const ics = buildIcs({
      uid: "x",
      startsAt: "2026-07-02T10:00:00Z",
      durationMinutes: 0,
      summary: "Cut",
    });
    expect(ics).toContain("DTSTART:20260702T100000Z");
    expect(ics).toContain("DTEND:20260702T103000Z");
  });

  it("omits LOCATION and DESCRIPTION when empty", () => {
    const ics = buildIcs({
      uid: "x",
      startsAt: "2026-07-02T10:00:00Z",
      durationMinutes: 30,
      summary: "Cut",
      location: "  ",
      description: null,
    });
    expect(ics).not.toContain("LOCATION:");
    expect(ics).not.toContain("DESCRIPTION:");
  });
});

describe("formatAddress", () => {
  it("filters empties and joins with commas", () => {
    expect(formatAddress(["214 Main St", null, "", "  ", "Danbury", "CT", "06810"])).toBe(
      "214 Main St, Danbury, CT, 06810",
    );
  });
  it("returns empty string when all parts empty", () => {
    expect(formatAddress([null, "", "  "])).toBe("");
  });
});

describe("buildMapsUrl", () => {
  it("URL-encodes destination and uses the dir endpoint", () => {
    expect(buildMapsUrl("214 Main St, Danbury, CT")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=214%20Main%20St%2C%20Danbury%2C%20CT",
    );
  });
  it("returns null when empty", () => {
    expect(buildMapsUrl("")).toBeNull();
    expect(buildMapsUrl("   ")).toBeNull();
  });
});
