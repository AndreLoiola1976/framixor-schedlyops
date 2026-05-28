import { describe, it, expect } from "vitest";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";

type Json = string | { [k: string]: Json };

function shape(node: Json): Json {
  if (typeof node === "string") return "<string>";
  const out: Record<string, Json> = {};
  for (const k of Object.keys(node).sort()) out[k] = shape(node[k]);
  return out;
}

function get(dict: Json, path: string): Json | undefined {
  return path.split(".").reduce<Json | undefined>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, Json>)[k] : undefined),
    dict as Json,
  );
}

describe("i18n dictionaries", () => {
  it("en and es share the same key shape", () => {
    expect(shape(es as unknown as Json)).toEqual(shape(en as unknown as Json));
  });

  it("plural keys exist and reference {count}", () => {
    for (const dict of [en, es]) {
      expect(dict.appointments.countOne).toContain("{count}");
      expect(dict.appointments.countOther).toContain("{count}");
    }
  });

  it("all leaf values are non-empty strings", () => {
    const walk = (node: Json, path: string[]) => {
      if (typeof node === "string") {
        expect(node.length, `empty at ${path.join(".")}`).toBeGreaterThan(0);
        return;
      }
      for (const k of Object.keys(node)) walk(node[k], [...path, k]);
    };
    walk(en as unknown as Json, ["en"]);
    walk(es as unknown as Json, ["es"]);
  });

  it("status labelKey values resolve in both dictionaries", async () => {
    const { statusDefinitions } = await import("@/config/statuses");
    for (const def of Object.values(statusDefinitions)) {
      for (const dict of [en, es]) {
        const v = get(dict as unknown as Json, def.labelKey);
        expect(typeof v).toBe("string");
        expect((v as string).length).toBeGreaterThan(0);
      }
    }
  });
});
