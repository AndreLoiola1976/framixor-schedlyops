import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ServicesGrid } from "@/components/features/services/ServicesGrid";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — SchedlyOps" },
      { name: "description", content: "Define and manage your bookable services." },
      { property: "og:title", content: "Services — SchedlyOps" },
      { property: "og:description", content: "Define and manage your bookable services." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        title={t.services.title}
        subtitle={t.services.subtitle}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t.services.new}
          </Button>
        }
      />
      <ServicesGrid />
    </div>
  );
}
