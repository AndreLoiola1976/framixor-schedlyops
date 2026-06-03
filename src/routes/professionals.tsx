import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ProfessionalsGrid } from "@/components/features/professionals/ProfessionalsGrid";
import { ProfessionalFormDialog } from "@/components/features/professionals/ProfessionalFormDialog";
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
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        title={t.professionals.title}
        subtitle={t.professionals.subtitle}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t.professionals.new}
          </Button>
        }
      />
      <ProfessionalsGrid />
      <ProfessionalFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
