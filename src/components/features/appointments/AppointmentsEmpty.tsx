import { CalendarCheck, CalendarClock, Search } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { useT } from "@/i18n/useT";
import type { QuickFilter } from "@/lib/appointments-filter";

interface Props {
  quick: QuickFilter;
  hasSearch: boolean;
}

export function AppointmentsEmpty({ quick, hasSearch }: Props) {
  const t = useT();
  if (hasSearch) {
    return <EmptyState title={t.appointments.empty.noMatches} icon={Search} />;
  }
  if (quick === "today") {
    return <EmptyState title={t.appointments.empty.today} icon={CalendarCheck} />;
  }
  if (quick === "upcoming") {
    return <EmptyState title={t.appointments.empty.upcoming} icon={CalendarClock} />;
  }
  return <EmptyState title={t.common.empty} />;
}
