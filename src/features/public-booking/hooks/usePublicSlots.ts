import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { listAvailableSlots } from "@/lib/booking-public";
import type { PublicProfessional } from "../api/publicProfessionals";

const FANOUT_LIMIT = 50;

export interface PublicSlotsArgs {
  tenantSlug: string;
  serviceId: string;
  professionalId: string; // "" or "any" means fan out across professionals
  /** YYYY-MM-DD */
  date: string;
  professionals: PublicProfessional[];
}

export interface SlotMap {
  /** Sorted unique slot ISO timestamps. */
  slots: string[];
  /** For "any" fan-out: slot → ordered list of professionalIds offering it. */
  bySlot: Map<string, string[]>;
  isLoading: boolean;
  isError: boolean;
  disabledReason: string | null;
}

const EMPTY: SlotMap = {
  slots: [],
  bySlot: new Map(),
  isLoading: false,
  isError: false,
  disabledReason: null,
};

function singleKey(args: {
  tenantSlug: string;
  professionalId: string;
  serviceId: string;
  date: string;
}) {
  return [
    "public-booking",
    "slots",
    args.tenantSlug,
    args.professionalId,
    args.serviceId,
    args.date,
  ] as const;
}

export function usePublicSlots(args: PublicSlotsArgs): SlotMap {
  const ready = !!args.tenantSlug && !!args.serviceId && !!args.date;
  const isAny = !args.professionalId || args.professionalId === "any";

  // Single-professional path
  const single = useQuery<string[]>({
    queryKey: singleKey({
      tenantSlug: args.tenantSlug,
      professionalId: args.professionalId,
      serviceId: args.serviceId,
      date: args.date,
    }),
    queryFn: () =>
      listAvailableSlots({
        tenantSlug: args.tenantSlug,
        professionalId: args.professionalId,
        serviceId: args.serviceId,
        date: args.date,
      }),
    enabled: ready && !isAny,
    staleTime: 30 * 1000,
  });

  // Fan-out path
  const fanoutPros = useMemo(
    () => (isAny ? args.professionals.slice(0, FANOUT_LIMIT) : []),
    [isAny, args.professionals],
  );
  const fanoutDisabled = isAny && args.professionals.length > FANOUT_LIMIT;

  const fanout = useQueries({
    queries: fanoutPros.map((p) => ({
      queryKey: singleKey({
        tenantSlug: args.tenantSlug,
        professionalId: p.id,
        serviceId: args.serviceId,
        date: args.date,
      }),
      queryFn: () =>
        listAvailableSlots({
          tenantSlug: args.tenantSlug,
          professionalId: p.id,
          serviceId: args.serviceId,
          date: args.date,
        }),
      enabled: ready && isAny && !fanoutDisabled,
      staleTime: 30 * 1000,
    })),
  });

  return useMemo<SlotMap>(() => {
    if (!ready) return EMPTY;
    if (!isAny) {
      const slots = single.data ?? [];
      const bySlot = new Map<string, string[]>();
      for (const s of slots) bySlot.set(s, [args.professionalId]);
      return {
        slots,
        bySlot,
        isLoading: single.isFetching,
        isError: single.isError,
        disabledReason: null,
      };
    }
    if (fanoutDisabled) {
      return {
        ...EMPTY,
        disabledReason: "too_many_professionals",
      };
    }
    const bySlot = new Map<string, string[]>();
    let isLoading = false;
    let isError = false;
    fanout.forEach((q, idx) => {
      if (q.isFetching) isLoading = true;
      if (q.isError) isError = true;
      const pid = fanoutPros[idx]?.id;
      if (!pid) return;
      for (const s of q.data ?? []) {
        const list = bySlot.get(s);
        if (list) {
          if (!list.includes(pid)) list.push(pid);
        } else {
          bySlot.set(s, [pid]);
        }
      }
    });
    const slots = [...bySlot.keys()].sort();
    return { slots, bySlot, isLoading, isError, disabledReason: null };
  }, [
    ready,
    isAny,
    single.data,
    single.isFetching,
    single.isError,
    fanout,
    fanoutPros,
    fanoutDisabled,
    args.professionalId,
  ]);
}

/**
 * Resolve which professional should receive the booking when the user picks
 * a slot under "any professional". Prefers `preferredId` (the original URL
 * preselection) when it appears in the bySlot list, else first entry.
 */
export function resolveProfessionalForSlot(
  bySlot: SlotMap["bySlot"],
  slot: string,
  preferredId?: string,
): string | null {
  const candidates = bySlot.get(slot);
  if (!candidates || candidates.length === 0) return null;
  if (preferredId && candidates.includes(preferredId)) return preferredId;
  return candidates[0] ?? null;
}
