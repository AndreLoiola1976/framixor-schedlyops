import { getSupabase } from "@/lib/supabase";
import type { Appointment } from "@/types/appointment";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import type {
  BookingFilter,
  DataSourceAdapter,
  ProfessionalCreateInput,
  ProfessionalUpdateInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  TenantInfo,
  WorkingHour,
  WorkingHoursUpsertInput,
} from "./types";

function rpc<T = unknown>(fn: string, args?: Record<string, unknown>) {
  return (
    getSupabase()
      .schema("scheduling")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .rpc(fn as any, args as any) as unknown as Promise<{
      data: T | null;
      error: { message: string } | null;
    }>
  );
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc<T>(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

// ---------- adapters ----------

type TenantRow = { tenant_id: string; slug: string; name: string; is_active: boolean };

function safeInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "??";
}

function adaptTenant(row: TenantRow): TenantInfo {
  const name = row?.name ?? "";
  return {
    id: row?.tenant_id ?? "",
    name,
    slug: row?.slug ?? "",
    industry: "",
    email: "",
    phone: "",
    address: "",
    timezone: "UTC",
    currency: "USD",
    locale: "en-US",
    logoInitials: safeInitials(name),
    hours: [],
    isLive: true,
    isActive: row?.is_active ?? false,
  };
}

type ServiceRow = {
  id: string;
  name: string;
  duration_min: number;
  price_cents: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

function adaptService(row: ServiceRow, tenantId: string): Service {
  return {
    id: row.id,
    tenantId,
    name: row.name,
    description: "",
    category: "",
    durationMinutes: row.duration_min,
    priceCents: row.price_cents,
    professionalIds: [],
    active: row.is_active,
  };
}

type ProfessionalRow = {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

function adaptProfessional(row: ProfessionalRow, tenantId: string): Professional {
  return {
    id: row.id,
    tenantId,
    name: row.name,
    role: "",
    email: "",
    phone: "",
    initials: safeInitials(row.name) === "??" ? "?" : safeInitials(row.name),
    specialties: [],
    workingDays: "",
    workingHours: "",
    active: row.is_active,
  };
}

type WorkingHoursRow = {
  id: string;
  professional_id: string;
  weekday: number;
  opens_at: string;
  closes_at: string;
  slot_minutes: number;
  is_active: boolean;
};

function adaptWorkingHours(row: WorkingHoursRow): WorkingHour {
  return {
    id: row.id,
    professionalId: row.professional_id,
    weekday: row.weekday,
    opensAt: row.opens_at,
    closesAt: row.closes_at,
    slotMinutes: row.slot_minutes,
    isActive: row.is_active,
  };
}

type BookingRow = {
  id: string;
  professional_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_phone: string;
  status: "confirmed" | "cancelled";
  created_at: string;
};

function adaptBooking(row: BookingRow, tenantId: string): Appointment {
  // Synthesize a stable clientId from phone so the existing UI keys work; no
  // customer entity exists backend-side (§9).
  const clientId = `phone:${row.customer_phone}`;
  return {
    id: row.id,
    tenantId,
    clientId,
    professionalId: row.professional_id,
    serviceId: row.service_id,
    startISO: row.starts_at,
    endISO: row.ends_at,
    status: row.status === "confirmed" ? "confirmed" : "cancelled",
    priceCents: 0,
    notes: row.customer_name, // displayed where the UI shows client name
  };
}

/**
 * operator_current_tenant is a TABLE-returning RPC: PostgREST returns an
 * array (0 or 1 rows). Empty array OR a `no_tenant_context` error means
 * "authenticated but not linked to a tenant" — a valid state, not an error.
 * Reserve thrown errors for real RPC/network/permission failures.
 */
export type TenantDiagnostic = {
  at: string;
  raw: unknown;
  rawCount: number | null;
  error: string | null;
  reason: "OK" | "NO_TENANT_LINK" | "RPC_ERROR" | "PENDING";
};

let lastTenantDiagnostic: TenantDiagnostic = {
  at: new Date().toISOString(),
  raw: null,
  rawCount: null,
  error: null,
  reason: "PENDING",
};

export function getLastTenantDiagnostic(): TenantDiagnostic {
  return lastTenantDiagnostic;
}

async function fetchTenantRow(): Promise<TenantRow | null> {
  const { data, error } = await rpc<TenantRow | TenantRow[]>("operator_current_tenant");
  const rawCount = Array.isArray(data) ? data.length : data ? 1 : 0;

  if (error) {
    const msg = error.message ?? "unknown rpc error";
    if (msg.toLowerCase().includes("no_tenant_context")) {
      lastTenantDiagnostic = {
        at: new Date().toISOString(),
        raw: data,
        rawCount,
        error: null,
        reason: "NO_TENANT_LINK",
      };
      return null;
    }
    lastTenantDiagnostic = {
      at: new Date().toISOString(),
      raw: data,
      rawCount,
      error: msg,
      reason: "RPC_ERROR",
    };
    throw new Error(msg);
  }

  const row = Array.isArray(data) ? data[0] : data;
  lastTenantDiagnostic = {
    at: new Date().toISOString(),
    raw: data,
    rawCount,
    error: null,
    reason: row?.tenant_id ? "OK" : "NO_TENANT_LINK",
  };
  return row ?? null;
}

let cachedTenantId: string | null = null;
async function tenantId(): Promise<string> {
  if (cachedTenantId) return cachedTenantId;
  const row = await fetchTenantRow();
  if (!row?.tenant_id) throw new Error("no_tenant_context");
  cachedTenantId = row.tenant_id;
  return cachedTenantId;
}

export function resetTenantCache(): void {
  cachedTenantId = null;
}

export const supabaseAdapter: DataSourceAdapter = {
  async getTenant(): Promise<TenantInfo | null> {
    const row = await fetchTenantRow();
    if (!row?.tenant_id) {
      cachedTenantId = null;
      return null;
    }
    cachedTenantId = row.tenant_id;
    return adaptTenant(row);
  },
  async listServices() {
    const tid = await tenantId();
    const rows = await call<ServiceRow[]>("operator_list_services");
    return (rows ?? []).map((r) => adaptService(r, tid));
  },
  async createService(input: ServiceCreateInput) {
    const tid = await tenantId();
    const rows = await call<ServiceRow[]>("operator_create_service", {
      p_name: input.name,
      p_duration_min: input.durationMinutes,
      p_price_cents: input.priceCents,
    });
    return adaptService(rows[0], tid);
  },
  async updateService(input: ServiceUpdateInput) {
    const tid = await tenantId();
    const rows = await call<ServiceRow[]>("operator_update_service", {
      p_service_id: input.id,
      p_name: input.name ?? null,
      p_duration_min: input.durationMinutes ?? null,
      p_price_cents: input.priceCents ?? null,
      p_is_active: input.isActive ?? null,
    });
    return adaptService(rows[0], tid);
  },
  async disableService(id: string) {
    const tid = await tenantId();
    const rows = await call<ServiceRow[]>("operator_disable_service", { p_service_id: id });
    return adaptService(rows[0], tid);
  },
  async listProfessionals() {
    const tid = await tenantId();
    const rows = await call<ProfessionalRow[]>("operator_list_professionals");
    return (rows ?? []).map((r) => adaptProfessional(r, tid));
  },
  async createProfessional(input: ProfessionalCreateInput) {
    const tid = await tenantId();
    const rows = await call<ProfessionalRow[]>("operator_create_professional", {
      p_name: input.name,
    });
    return adaptProfessional(rows[0], tid);
  },
  async updateProfessional(input: ProfessionalUpdateInput) {
    const tid = await tenantId();
    const rows = await call<ProfessionalRow[]>("operator_update_professional", {
      p_professional_id: input.id,
      p_name: input.name ?? null,
      p_is_active: input.isActive ?? null,
    });
    return adaptProfessional(rows[0], tid);
  },
  async disableProfessional(id: string) {
    const tid = await tenantId();
    const rows = await call<ProfessionalRow[]>("operator_disable_professional", {
      p_professional_id: id,
    });
    return adaptProfessional(rows[0], tid);
  },
  async listWorkingHours(professionalId?: string) {
    const rows = await call<WorkingHoursRow[]>("operator_list_working_hours", {
      p_professional_id: professionalId ?? null,
    });
    return (rows ?? []).map(adaptWorkingHours);
  },
  async upsertWorkingHours(input: WorkingHoursUpsertInput) {
    const rows = await call<WorkingHoursRow[]>("operator_upsert_working_hours", {
      p_professional_id: input.professionalId,
      p_weekday: input.weekday,
      p_opens_at: input.opensAt,
      p_closes_at: input.closesAt,
      p_slot_minutes: input.slotMinutes,
      p_id: input.id ?? null,
      p_is_active: input.isActive ?? true,
    });
    return adaptWorkingHours(rows[0]);
  },
  async listBookings(filter?: BookingFilter): Promise<Appointment[]> {
    const tid = await tenantId();
    const rows = await call<BookingRow[]>("operator_list_bookings", {
      p_from: filter?.from ?? null,
      p_to: filter?.to ?? null,
      p_professional_id: filter?.professionalId ?? null,
    });
    return (rows ?? []).map((r) => adaptBooking(r, tid));
  },
  async listClients() {
    return []; // no customer entity in the backend (§9)
  },
};
