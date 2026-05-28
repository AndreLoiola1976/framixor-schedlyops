export interface Professional {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  initials: string;
  specialties: string[];
  workingDays: string;
  workingHours: string;
  active: boolean;
}
