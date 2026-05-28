export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  tenantId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  startISO: string;
  endISO: string;
  status: AppointmentStatus;
  notes?: string;
  priceCents: number;
}
