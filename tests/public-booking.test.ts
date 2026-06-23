import { describe, it, expect, beforeEach, vi } from "vitest";

const rpcMock = vi.fn<(fn: string, args: unknown) => Promise<{ data: unknown; error: unknown }>>();
const schemaMock = vi.fn((_schema: string) => ({ rpc: rpcMock }));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    schema: schemaMock,
    functions: { invoke: vi.fn() },
  }),
}));

import { publicRpc, PublicRpcError } from "@/features/public-booking/api/rpc";
import { getPublicTenantProfile } from "@/features/public-booking/api/publicTenant";
import { listPublicServices } from "@/features/public-booking/api/publicServices";
import { listPublicProfessionals } from "@/features/public-booking/api/publicProfessionals";
import { validatePreselection } from "@/features/public-booking/lib/validatePreselection";
import { resolveProfessionalForSlot } from "@/features/public-booking/hooks/usePublicSlots";

beforeEach(() => {
  rpcMock.mockReset();
  schemaMock.mockClear();
});

describe("publicRpc", () => {
  it("calls the requested schema + fn with args and returns data", async () => {
    rpcMock.mockResolvedValueOnce({ data: [{ x: 1 }], error: null });
    const out = await publicRpc("scheduling", "public_list_services", { p_tenant_slug: "x" });
    expect(schemaMock).toHaveBeenCalledWith("scheduling");
    expect(rpcMock).toHaveBeenCalledWith("public_list_services", { p_tenant_slug: "x" });
    expect(out).toEqual([{ x: 1 }]);
  });

  it("throws PublicRpcError on backend error", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: "boom", code: "42P01" } });
    await expect(
      publicRpc("core", "public_get_tenant_profile", { p_slug: "x" }),
    ).rejects.toBeInstanceOf(PublicRpcError);
  });
});

describe("getPublicTenantProfile", () => {
  it("takes [0] when RPC returns an array and adapts fields", async () => {
    rpcMock.mockResolvedValueOnce({
      data: [
        {
          tenant_id: "t-1",
          slug: "demo",
          display_name: "Demo Salon",
          tagline: "Be sharp",
          timezone: "UTC",
        },
      ],
      error: null,
    });
    const t = await getPublicTenantProfile("demo");
    expect(t).toEqual({
      tenantId: "t-1",
      slug: "demo",
      displayName: "Demo Salon",
      tagline: "Be sharp",
      description: null,
      logoUrl: null,
      websiteUrl: null,
      publicEmail: null,
      publicPhone: null,
      timezone: "UTC",
      countryCode: null,
    });
  });

  it("returns null when RPC returns []", async () => {
    rpcMock.mockResolvedValueOnce({ data: [], error: null });
    expect(await getPublicTenantProfile("missing")).toBeNull();
  });

  it("returns null when RPC returns null", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });
    expect(await getPublicTenantProfile("missing")).toBeNull();
  });
});

describe("listPublicServices", () => {
  it("adapts rows and drops entries without id", async () => {
    rpcMock.mockResolvedValueOnce({
      data: [{ id: "s-1", name: "Cut", duration_min: 30, price_cents: 3000 }, { name: "Bad row" }],
      error: null,
    });
    const out = await listPublicServices("demo");
    expect(out).toEqual([{ id: "s-1", name: "Cut", durationMinutes: 30, priceCents: 3000 }]);
  });
});

describe("listPublicProfessionals", () => {
  it("adapts rows", async () => {
    rpcMock.mockResolvedValueOnce({
      data: [
        { id: "p-1", name: "Alex" },
        { id: "p-2", display_name: "Sam" },
      ],
      error: null,
    });
    expect(await listPublicProfessionals("demo")).toEqual([
      { id: "p-1", name: "Alex" },
      { id: "p-2", name: "Sam" },
    ]);
  });
});

describe("validatePreselection", () => {
  const services = [{ id: "s-1", name: "Cut", durationMinutes: 30, priceCents: 0 }];
  const professionals = [{ id: "p-1", name: "Alex" }];

  it("keeps both when valid", () => {
    expect(
      validatePreselection({ serviceId: "s-1", professionalId: "p-1", services, professionals }),
    ).toEqual({ serviceId: "s-1", professionalId: "p-1" });
  });

  it("drops unknown service", () => {
    expect(
      validatePreselection({ serviceId: "nope", professionalId: "p-1", services, professionals }),
    ).toEqual({ serviceId: "", professionalId: "p-1" });
  });

  it("drops unknown professional", () => {
    expect(
      validatePreselection({ serviceId: "s-1", professionalId: "nope", services, professionals }),
    ).toEqual({ serviceId: "s-1", professionalId: "" });
  });

  it("handles missing values", () => {
    expect(validatePreselection({ services, professionals })).toEqual({
      serviceId: "",
      professionalId: "",
    });
  });
});

describe("resolveProfessionalForSlot", () => {
  it("returns null when slot has no candidates", () => {
    expect(resolveProfessionalForSlot(new Map(), "2030-01-01T10:00:00Z")).toBeNull();
  });

  it("prefers the preferredId when present in the candidate list", () => {
    const m = new Map<string, string[]>([["s", ["a", "b", "c"]]]);
    expect(resolveProfessionalForSlot(m, "s", "b")).toBe("b");
  });

  it("falls back to first candidate otherwise", () => {
    const m = new Map<string, string[]>([["s", ["a", "b"]]]);
    expect(resolveProfessionalForSlot(m, "s", "z")).toBe("a");
    expect(resolveProfessionalForSlot(m, "s")).toBe("a");
  });
});
