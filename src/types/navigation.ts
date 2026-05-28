import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  labelKey: string;
  to: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  labelKey: string;
  items: NavItem[];
}
