import type { Appointment } from "@/types/appointment";
import type { Professional } from "@/types/professional";
import type { Service } from "@/types/service";
import { dayKeyInTz } from "@/lib/today-key";

export type QuickFilter =
  | "today"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "no_show"
  | "all";

export const QUICK_FILTERS: QuickFilter[] = [
  "today",
  "upcoming",
  "completed",
  "cancelled",
  "no_show",
  "all",
];

export interface FilterInput {
  quick: QuickFilter;
  professionalId: string | "all";
  search: string;
  todayKey: string | null;
  /** ISO instant of "now" — injectable for tests. */
  nowISO: string;
  timezone?: string;
  serviceMap: Record<string, Service>;
  professionalMap: Record<string, Professional>;
}

const STATUS_QUICKS = new Set<QuickFilter>(["completed", "cancelled", "no_show"]);

function digits(s: string): string {
  return s.replace(/\D+/g, "");
}

function matchesSearch(
  a: Appointment,
  needle: string,
  serviceMap: Record<string, Service>,
  professionalMap: Record<string, Professional>,
): boolean {
  if (!needle) return true;
  const isBlock = a.type === "block";
  if (isBlock) return false; // blocks have no customer/service to search
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  const qDigits = digits(q);
  const name = (a.customerName ?? "").toLowerCase();
  const phoneDigits = digits(a.customerPhone ?? "");
  const service = serviceMap[a.serviceId]?.name?.toLowerCase() ?? "";
  const pro = professionalMap[a.professionalId]?.name?.toLowerCase() ?? "";
  if (name.includes(q)) return true;
  if (service.includes(q)) return true;
  if (pro.includes(q)) return true;
  if (qDigits && phoneDigits.includes(qDigits)) return true;
  return false;
}

/**
 * Pure filter for the Appointments list.
 *
 * Block semantics:
 *   - `today`: visible if the block's tz-day matches `todayKey`.
 *   - `upcoming`: visible only when `startISO >= nowISO` (future blocks).
 *   - `all`: visible.
 *   - `completed` / `cancelled` / `no_show`: blocks are hidden.
 *   - When a search term is present, blocks are always hidden (no fields
 *     to match against).
 *
 * Search ignores blocks. Professional filter applies to blocks too.
 */
export function filterAppointments(all: Appointment[], input: FilterInput): Appointment[] {
  const { quick, professionalId, search, todayKey, nowISO, timezone, serviceMap, professionalMap } =
    input;

  return all.filter((a) => {
    const isBlock = a.type === "block";

    // Professional filter
    if (professionalId !== "all" && a.professionalId !== professionalId) return false;

    // Quick filter
    switch (quick) {
      case "today": {
        if (!todayKey) return false;
        if (dayKeyInTz(a.startISO, timezone) !== todayKey) return false;
        break;
      }
      case "upcoming": {
        if (a.startISO < nowISO) return false;
        if (isBlock) {
          // future blocks only — already gated above
        } else if (
          a.status === "cancelled" ||
          a.status === "no_show" ||
          a.status === "completed"
        ) {
          return false;
        }
        break;
      }
      case "all":
        break;
      default: {
        if (isBlock) return false;
        if (!STATUS_QUICKS.has(quick)) return false;
        if (a.status !== quick) return false;
      }
    }

    // Search
    if (search.trim()) {
      if (!matchesSearch(a, search, serviceMap, professionalMap)) return false;
    }

    return true;
  });
}
