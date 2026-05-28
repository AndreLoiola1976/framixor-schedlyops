import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/components/features/clients/ClientsTable";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — SchedlyOps" },
      { name: "description", content: "Your customer directory with visit history and value." },
      { property: "og:title", content: "Clients — SchedlyOps" },
      { property: "og:description", content: "Your customer directory with visit history and value." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        title={t.clients.title}
        subtitle={t.clients.subtitle}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t.clients.new}
          </Button>
        }
      />
      <ClientsTable />
    </div>
  );
}
