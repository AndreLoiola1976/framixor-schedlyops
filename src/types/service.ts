export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  professionalIds: string[];
  active: boolean;
}
