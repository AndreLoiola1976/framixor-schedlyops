import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n/useT";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — SchedlyOps" },
      { name: "description", content: "Customer directory (pilot — not yet implemented)." },
      { property: "og:title", content: "Clients — SchedlyOps" },
      { property: "og:description", content: "Customer directory (pilot — not yet implemented)." },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader title={t.clients.title} subtitle={t.clients.subtitle} />
      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-8">
          <Badge variant="secondary" className="text-xs uppercase tracking-wider">
            {t.clients.pilotBadge}
          </Badge>
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t.clients.pilotMessage}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
