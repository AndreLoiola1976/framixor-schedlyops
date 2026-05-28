export interface Client {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  totalVisits: number;
  lastVisitISO: string | null;
  lifetimeValueCents: number;
  tags: string[];
}
