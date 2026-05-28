import type { Branding } from "./branding";

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface BusinessHours {
  day: WeekDay;
  open: string; // "09:00"
  close: string; // "18:00"
  closed?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  locale: string;
  logoInitials: string;
  hours: BusinessHours[];
  branding?: Branding;
}
