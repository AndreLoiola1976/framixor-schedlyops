import { describe, expect, it } from "vitest";
import { buildShareSnippets, computeReadiness } from "@/lib/launch-kit";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";
import { ptBR } from "@/i18n/pt-BR";

describe("buildShareSnippets", () => {
  const templates = {
    instagram: "Book with {name}: {url}",
    whatsapp: "Hi! Book with {name} here: {url}",
    googleBusiness: "{name} — book online: {url}",
  };

  it("interpolates name and url", () => {
    const out = buildShareSnippets({ name: "Acme Cuts", url: "https://x/book/acme", templates });
    expect(out.instagram).toBe("Book with Acme Cuts: https://x/book/acme");
    expect(out.whatsapp).toContain("Acme Cuts");
    expect(out.googleBusiness).toContain("https://x/book/acme");
  });

  it("tolerates missing fields without throwing", () => {
    const out = buildShareSnippets({ name: "", url: "", templates });
    expect(out.instagram).toBe("Book with :");
  });
});

describe("computeReadiness", () => {
  it("counts only non-future items", () => {
    const r = computeReadiness({
      displayName: "Acme",
      activeServicesCount: 1,
      activeProfessionalsCount: 0,
      hasSlug: true,
    });
    expect(r.totalCount).toBe(4);
    expect(r.doneCount).toBe(3);
    expect(r.items.find((i) => i.id === "workingHours")?.future).toBe(true);
  });

  it("treats blank display name as not done", () => {
    const r = computeReadiness({
      displayName: "   ",
      activeServicesCount: 0,
      activeProfessionalsCount: 0,
      hasSlug: false,
    });
    expect(r.doneCount).toBe(0);
  });
});

describe("launchKit i18n parity", () => {
  const keys = [
    "shareTitle",
    "checklistTitle",
    "progress",
    "comingSoon",
    "share.instagram.label",
    "share.whatsapp.label",
    "share.googleBusiness.label",
    "share.instagram.template",
    "share.whatsapp.template",
    "share.googleBusiness.template",
    "checklist.businessName",
    "checklist.activeService",
    "checklist.activeProfessional",
    "checklist.bookingLink",
    "checklist.workingHours",
    "copied",
    "copyFailed",
  ];

  function get(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>(
      (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined),
      obj,
    );
  }

  for (const dict of [
    { name: "en", d: en },
    { name: "es", d: es },
    { name: "pt-BR", d: ptBR },
  ]) {
    it(`${dict.name} has launchKit keys`, () => {
      const lk = (dict.d.settings.publicPage as Record<string, unknown>).launchKit;
      expect(lk).toBeTruthy();
      for (const k of keys) {
        const v = get(lk, k);
        expect(typeof v, `${dict.name}: ${k}`).toBe("string");
        expect((v as string).length).toBeGreaterThan(0);
      }
    });
  }
});
