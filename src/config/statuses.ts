import type { AppointmentStatus } from "@/types/appointment";

export interface StatusDefinition {
  id: AppointmentStatus;
  labelKey: string;
  /** Tailwind classes using semantic tokens only. */
  className: string;
  dotClassName: string;
}

export const statusDefinitions: Record<AppointmentStatus, StatusDefinition> = {
  confirmed: {
    id: "confirmed",
    labelKey: "status.confirmed",
    className: "bg-success/10 text-success border-success/20",
    dotClassName: "bg-success",
  },
  pending: {
    id: "pending",
    labelKey: "status.pending",
    className: "bg-warning/10 text-warning border-warning/20",
    dotClassName: "bg-warning",
  },
  completed: {
    id: "completed",
    labelKey: "status.completed",
    className: "bg-muted text-muted-foreground border-border",
    dotClassName: "bg-muted-foreground",
  },
  cancelled: {
    id: "cancelled",
    labelKey: "status.cancelled",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    dotClassName: "bg-destructive",
  },
  no_show: {
    id: "no_show",
    labelKey: "status.no_show",
    className: "bg-accent text-accent-foreground border-border",
    dotClassName: "bg-foreground/40",
  },
};

export const allStatuses: AppointmentStatus[] = [
  "confirmed",
  "pending",
  "completed",
  "cancelled",
  "no_show",
];
