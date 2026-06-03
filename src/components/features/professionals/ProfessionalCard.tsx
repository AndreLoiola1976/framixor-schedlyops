import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Professional } from "@/types/professional";
import { useServices } from "@/hooks/useServices";
import { useT } from "@/i18n/useT";
import { Mail, Phone, Pencil, PowerOff, CalendarClock } from "lucide-react";
import { useDisableProfessional } from "@/hooks/useSchedulingMutations";
import { ProfessionalFormDialog } from "./ProfessionalFormDialog";
import { WorkingHoursDialog } from "./WorkingHoursDialog";

interface ProfessionalCardProps {
  pro: Professional;
}

export function ProfessionalCard({ pro }: ProfessionalCardProps) {
  const t = useT();
  const services = useServices();
  const servicesCount = services.filter((s) => s.professionalIds.includes(pro.id)).length;

  const disable = useDisableProfessional();
  const [editOpen, setEditOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Card className="transition-colors hover:border-foreground/20">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {pro.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-base font-semibold text-foreground">
                {pro.name}
              </h3>
              {pro.role ? (
                <p className="truncate text-xs text-muted-foreground">{pro.role}</p>
              ) : null}
            </div>
            <span
              className={
                pro.active
                  ? "inline-flex items-center gap-1 text-xs font-medium text-success"
                  : "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"
              }
            >
              <span
                className={
                  pro.active
                    ? "h-1.5 w-1.5 rounded-full bg-success"
                    : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
                }
              />
              {pro.active ? t.common.active : t.common.inactive}
            </span>
          </div>

          {pro.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pro.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          ) : null}

          {pro.email || pro.phone ? (
            <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
              {pro.email ? (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {pro.email}
                </span>
              ) : null}
              {pro.phone ? (
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {pro.phone}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium tabular-nums">
              {servicesCount} {t.professionals.services}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t.common.edit}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setHoursOpen(true)}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {t.professionals.manageHours}
            </Button>
            {pro.active ? (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-muted-foreground"
                onClick={() => setConfirmOpen(true)}
              >
                <PowerOff className="h-3.5 w-3.5" />
                {t.common.disable}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <ProfessionalFormDialog open={editOpen} onOpenChange={setEditOpen} professional={pro} />
      <WorkingHoursDialog open={hoursOpen} onOpenChange={setHoursOpen} professional={pro} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.professionals.disable}</AlertDialogTitle>
            <AlertDialogDescription>{t.professionals.disableConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => disable.mutate(pro.id)} disabled={disable.isPending}>
              {t.common.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
