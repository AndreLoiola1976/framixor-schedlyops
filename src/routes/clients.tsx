import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClientsList } from "@/components/features/clients/ClientsList";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — SchedlyOps" },
      {
        name: "description",
        content: "Customer history derived from your bookings.",
      },
      { property: "og:title", content: "Clients — SchedlyOps" },
      {
        property: "og:description",
        content: "Customer history derived from your bookings.",
      },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader title={t.clients.title} subtitle={t.clients.subtitle} />
      <ClientsList />
    </div>
  );
}
