import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ProfessionalsGrid } from "@/components/features/professionals/ProfessionalsGrid";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/professionals")({
  head: () => ({
    meta: [
      { title: "Professionals — SchedlyOps" },
      { name: "description", content: "Your team, their specialties, and their schedules." },
      { property: "og:title", content: "Professionals — SchedlyOps" },
      { property: "og:description", content: "Your team, their specialties, and their schedules." },
    ],
  }),
  component: ProfessionalsPage,
});

function ProfessionalsPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        title={t.professionals.title}
        subtitle={t.professionals.subtitle}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            {t.professionals.new}
          </Button>
        }
      />
      <ProfessionalsGrid />
    </div>
  );
}
