import { useQuery } from "@tanstack/react-query";
import { dataSource } from "@/lib/data-source";
import { qk } from "@/lib/query-keys";
import type { Client } from "@/types/client";

export function useClientsQuery() {
  return useQuery({
    queryKey: qk.clients,
    queryFn: () => dataSource.listClients(),
    initialData: [] as Client[],
  });
}

export function useClients(): Client[] {
  return useClientsQuery().data;
}

export function useClientMap(): Record<string, Client> {
  const list = useClients();
  return Object.fromEntries(list.map((c) => [c.id, c]));
}
