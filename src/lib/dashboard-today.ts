import type { Appointment } from "@/types/appointment";
import type { Professional } from "@/types/professional";
import { dayKey } from "@/lib/format";

export interface TodayCounts {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface ProfessionalDayBucket {
  professionalId: string;
  items: Appointment[];
}

export interface DashboardToday {
  /** All today's rows (includes blocks) sorted by startISO ascending. */
  todayAppointments: Appointment[];
  /** Today's customer-facing appointments (excludes blocks). */
  customerAppointments: Appointment[];
  /**
   * Next upcoming customer appointment that is still actionable: excludes
   * blocks, cancelled, no_show, and completed. `null` when none remain today.
   */
  nextAppointment: Appointment | null;
  counts: TodayCounts;
  /** Sum of priceCents for COMPLETED customer appointments only. */
  estimatedRevenueCents: number;
  /** One bucket per active professional, ordered by professional list. */
  byProfessional: ProfessionalDayBucket[];
}

function isBlock(a: Appointment): boolean {
  return a.type === "block";
}

export function deriveDashboardToday(
  appointments: Appointment[],
  todayKey: string,
  professionals: Professional[],
  now: Date = new Date(),
): DashboardToday {
  const today = appointments
    .filter((a) => dayKey(a.startISO) === todayKey)
    .slice()
    .sort((a, b) => a.startISO.localeCompare(b.startISO));

  const customer = today.filter((a) => !isBlock(a));

  const nowISO = now.toISOString();
  const nextAppointment =
    customer.find(
      (a) =>
        a.startISO >= nowISO &&
        a.status !== "cancelled" &&
        a.status !== "no_show" &&
        a.status !== "completed",
    ) ?? null;

  const counts: TodayCounts = {
    total: customer.length,
    completed: customer.filter((a) => a.status === "completed").length,
    cancelled: customer.filter((a) => a.status === "cancelled").length,
    noShow: customer.filter((a) => a.status === "no_show").length,
  };

  const estimatedRevenueCents = customer
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.priceCents ?? 0), 0);

  const activePros = professionals.filter((p) => p.active);
  const byProfessional: ProfessionalDayBucket[] = activePros.map((p) => ({
    professionalId: p.id,
    items: today.filter((a) => a.professionalId === p.id),
  }));

  return {
    todayAppointments: today,
    customerAppointments: customer,
    nextAppointment,
    counts,
    estimatedRevenueCents,
    byProfessional,
  };
}
