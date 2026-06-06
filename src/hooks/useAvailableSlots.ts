import { useQuery } from "@tanstack/react-query";
import { IS_SUPABASE } from "@/lib/env";
import { listAvailableSlots } from "@/lib/booking-public";
import { useSession } from "@/hooks/useSession";

export interface UseAvailableSlotsArgs {
  tenantSlug: string | undefined;
  professionalId: string | undefined;
  serviceId: string | undefined;
  /** YYYY-MM-DD */
  date: string | undefined;
}

export function availableSlotsKey(args: UseAvailableSlotsArgs) {
  return [
    "available-slots",
    args.tenantSlug ?? "",
    args.professionalId ?? "",
    args.serviceId ?? "",
    args.date ?? "",
  ] as const;
}

export function useAvailableSlots(args: UseAvailableSlotsArgs) {
  const { session, loading } = useSession();
  const ready =
    IS_SUPABASE &&
    !loading &&
    !!session?.user?.id &&
    !!args.tenantSlug &&
    !!args.professionalId &&
    !!args.serviceId &&
    !!args.date;

  return useQuery<string[]>({
    queryKey: availableSlotsKey(args),
    queryFn: () =>
      listAvailableSlots({
        tenantSlug: args.tenantSlug!,
        professionalId: args.professionalId!,
        serviceId: args.serviceId!,
        date: args.date!,
      }),
    enabled: ready,
    staleTime: 30 * 1000,
    initialData: [] as string[],
  });
}
