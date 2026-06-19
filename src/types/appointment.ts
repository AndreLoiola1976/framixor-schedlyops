export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no_show";

/** Row kind from operator_list_bookings. "block" rows have null customer/service fields. */
export type AppointmentKind = "appointment" | "block";

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
  /** Optional — only present once 0018-era fields land on DEV. */
  type?: AppointmentKind;
  source?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
}
