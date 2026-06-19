import { activeTenant } from "@/config/tenant";
import { services as svcSeed } from "@/config/services";
import { professionals as proSeed } from "@/config/professionals";
import { appointments as apptSeed } from "@/config/appointments";
import { clients as cliSeed } from "@/config/clients";
import type { Service } from "@/types/service";
import type { Professional } from "@/types/professional";
import type { Appointment } from "@/types/appointment";
import type { Client } from "@/types/client";
import type {
  DataSourceAdapter,
  ProfessionalCreateInput,
  ProfessionalUpdateInput,
  ServiceCreateInput,
  ServiceUpdateInput,
  TenantInfo,
  WorkingHour,
  WorkingHoursUpsertInput,
  BookingFilter,
} from "./types";

// In-memory mutable copies so mock mode supports create/update/disable too.
const services: Service[] = svcSeed.map((s) => ({ ...s }));
const professionals: Professional[] = proSeed.map((p) => ({ ...p }));
const workingHours: WorkingHour[] = [];

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const mockAdapter: DataSourceAdapter = {
  async getTenant(): Promise<TenantInfo | null> {
    return { ...activeTenant, isLive: false, isActive: true };
  },
  async listServices() {
    return services.slice();
  },
  async createService(input: ServiceCreateInput) {
    const svc: Service = {
      id: uid("svc"),
      tenantId: activeTenant.id,
      name: input.name,
      description: "",
      category: "",
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      professionalIds: [],
      active: true,
    };
    services.push(svc);
    return svc;
  },
  async updateService(input: ServiceUpdateInput) {
    const i = services.findIndex((s) => s.id === input.id);
    if (i < 0) throw new Error("not_found");
    const cur = services[i];
    services[i] = {
      ...cur,
      name: input.name ?? cur.name,
      durationMinutes: input.durationMinutes ?? cur.durationMinutes,
      priceCents: input.priceCents ?? cur.priceCents,
      active: input.isActive ?? cur.active,
    };
    return services[i];
  },
  async disableService(id: string) {
    return this.updateService({ id, isActive: false });
  },
  async listProfessionals() {
    return professionals.slice();
  },
  async createProfessional(input: ProfessionalCreateInput) {
    const pro: Professional = {
      id: uid("pro"),
      tenantId: activeTenant.id,
      name: input.name,
      role: "",
      email: "",
      phone: "",
      initials: input.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      specialties: [],
      workingDays: "",
      workingHours: "",
      active: true,
    };
    professionals.push(pro);
    return pro;
  },
  async updateProfessional(input: ProfessionalUpdateInput) {
    const i = professionals.findIndex((p) => p.id === input.id);
    if (i < 0) throw new Error("not_found");
    const cur = professionals[i];
    professionals[i] = {
      ...cur,
      name: input.name ?? cur.name,
      active: input.isActive ?? cur.active,
    };
    return professionals[i];
  },
  async disableProfessional(id: string) {
    return this.updateProfessional({ id, isActive: false });
  },
  async listWorkingHours(professionalId?: string) {
    return professionalId
      ? workingHours.filter((w) => w.professionalId === professionalId)
      : workingHours.slice();
  },
  async upsertWorkingHours(input: WorkingHoursUpsertInput) {
    if (input.id) {
      const i = workingHours.findIndex((w) => w.id === input.id);
      if (i < 0) throw new Error("not_found");
      workingHours[i] = {
        ...workingHours[i],
        professionalId: input.professionalId,
        weekday: input.weekday,
        opensAt: input.opensAt,
        closesAt: input.closesAt,
        slotMinutes: input.slotMinutes,
        isActive: input.isActive ?? workingHours[i].isActive,
      };
      return workingHours[i];
    }
    const w: WorkingHour = {
      id: uid("wh"),
      professionalId: input.professionalId,
      weekday: input.weekday,
      opensAt: input.opensAt,
      closesAt: input.closesAt,
      slotMinutes: input.slotMinutes,
      isActive: input.isActive ?? true,
    };
    workingHours.push(w);
    return w;
  },
  async listBookings(filter?: BookingFilter): Promise<Appointment[]> {
    let rows = apptSeed.slice();
    if (filter?.professionalId) {
      rows = rows.filter((a) => a.professionalId === filter.professionalId);
    }
    if (filter?.from) {
      rows = rows.filter((a) => a.startISO >= filter.from!);
    }
    if (filter?.to) {
      rows = rows.filter((a) => a.startISO < filter.to!);
    }
    return rows.sort((a, b) => a.startISO.localeCompare(b.startISO));
  },
  async listClients(): Promise<Client[]> {
    return cliSeed.slice();
  },
};
