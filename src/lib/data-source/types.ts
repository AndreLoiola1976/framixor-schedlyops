import type { Appointment } from "@/types/appointment";
import type { Client } from "@/types/client";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import type { Tenant } from "@/types/tenant";

export interface TenantInfo extends Tenant {
  /** True when supplied by operator_current_tenant (vs mock defaults). */
  isLive?: boolean;
  isActive?: boolean;
}

export interface WorkingHour {
  id: string;
  professionalId: string;
  weekday: number; // 0=Sun..6=Sat
  opensAt: string; // "HH:MM:SS"
  closesAt: string;
  slotMinutes: number;
  isActive: boolean;
}

export interface ServiceCreateInput {
  name: string;
  durationMinutes: number;
  priceCents: number;
}

export interface ServiceUpdateInput {
  id: string;
  name?: string;
  durationMinutes?: number;
  priceCents?: number;
  isActive?: boolean;
}

export interface ProfessionalCreateInput {
  name: string;
}

export interface ProfessionalUpdateInput {
  id: string;
  name?: string;
  isActive?: boolean;
}

export interface WorkingHoursUpsertInput {
  id?: string;
  professionalId: string;
  weekday: number;
  opensAt: string;
  closesAt: string;
  slotMinutes: number;
  isActive?: boolean;
}

export interface BookingFilter {
  from?: string;
  to?: string;
  professionalId?: string;
}

export interface DataSourceAdapter {
  /** Returns null when the signed-in user is not linked to any tenant. */
  getTenant(): Promise<TenantInfo | null>;
  listServices(): Promise<Service[]>;
  createService(input: ServiceCreateInput): Promise<Service>;
  updateService(input: ServiceUpdateInput): Promise<Service>;
  disableService(id: string): Promise<Service>;
  listProfessionals(): Promise<Professional[]>;
  createProfessional(input: ProfessionalCreateInput): Promise<Professional>;
  updateProfessional(input: ProfessionalUpdateInput): Promise<Professional>;
  disableProfessional(id: string): Promise<Professional>;
  listWorkingHours(professionalId?: string): Promise<WorkingHour[]>;
  upsertWorkingHours(input: WorkingHoursUpsertInput): Promise<WorkingHour>;
  listBookings(filter?: BookingFilter): Promise<Appointment[]>;
  /** Mock-only. Returns [] in supabase mode (no customer entity backend-side). */
  listClients(): Promise<Client[]>;
}
