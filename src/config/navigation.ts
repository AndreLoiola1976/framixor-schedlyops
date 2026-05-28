import { CalendarDays, LayoutDashboard, Scissors, Settings, Users, UserCircle2 } from "lucide-react";
import type { NavSection } from "@/types/navigation";

export const navigation: NavSection[] = [
  {
    id: "main",
    labelKey: "nav.main",
    items: [
      { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard", icon: LayoutDashboard },
      { id: "appointments", labelKey: "nav.appointments", to: "/appointments", icon: CalendarDays },
      { id: "services", labelKey: "nav.services", to: "/services", icon: Scissors },
      { id: "professionals", labelKey: "nav.professionals", to: "/professionals", icon: UserCircle2 },
      { id: "clients", labelKey: "nav.clients", to: "/clients", icon: Users },
    ],
  },
  {
    id: "account",
    labelKey: "nav.account",
    items: [
      { id: "settings", labelKey: "nav.settings", to: "/settings", icon: Settings },
    ],
  },
];
