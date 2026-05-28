import type { Tenant } from "@/types/tenant";

export const activeTenant: Tenant = {
  id: "tenant_glow",
  name: "Glow Studio",
  slug: "glow-studio",
  industry: "Beauty & Wellness",
  email: "hello@glowstudio.co",
  phone: "+1 (415) 555-0142",
  address: "221 Hayes Street, San Francisco, CA",
  timezone: "America/Los_Angeles",
  currency: "USD",
  locale: "en-US",
  logoInitials: "GS",
  hours: [
    { day: "mon", open: "09:00", close: "19:00" },
    { day: "tue", open: "09:00", close: "19:00" },
    { day: "wed", open: "09:00", close: "19:00" },
    { day: "thu", open: "09:00", close: "20:00" },
    { day: "fri", open: "09:00", close: "20:00" },
    { day: "sat", open: "10:00", close: "18:00" },
    { day: "sun", open: "00:00", close: "00:00", closed: true },
  ],
};
