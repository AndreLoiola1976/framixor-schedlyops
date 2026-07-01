import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildIcs, buildMapsUrl, downloadIcs, formatAddress } from "../lib/ics";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { SlotTakenError } from "@/lib/booking-public";
import { toUserMessage } from "@/lib/scheduling-errors";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { usePublicTenant } from "../hooks/usePublicTenant";
import { usePublicProfessionals, usePublicServices } from "../hooks/usePublicCatalog";
import { resolveProfessionalForSlot, usePublicSlots } from "../hooks/usePublicSlots";
import { validatePreselection } from "../lib/validatePreselection";
import { buildDayStrip, type DayCell } from "../lib/dayStrip";
import { PUBLIC_BOOKING_LOCALE } from "../lib/locale";
import type { PublicService } from "../api/publicServices";
import type { PublicProfessional } from "../api/publicProfessionals";
import type { PublicTenantProfile } from "../api/publicTenant";

const ANY_PRO = "any";
const DAY_STRIP_COUNT = 7;

// Hide native scrollbars on horizontal strips while keeping scroll behavior.
const HIDE_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatSlotTime(iso: string, timezone: string | null | undefined): string {
  try {
    return new Intl.DateTimeFormat(PUBLIC_BOOKING_LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatPrice(cents: number): string | null {
  if (!cents || cents <= 0) return null;
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
}

function formatDuration(min: number): string | null {
  if (!min || min <= 0) return null;
  return `${min}M`;
}

function deriveInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "·";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || cleaned[0]!.toUpperCase();
}

function weekdayLong(iso: string | undefined, tz: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(PUBLIC_BOOKING_LOCALE, {
      weekday: "short",
      timeZone: tz || undefined,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export interface PublicBookingPageProps {
  tenantSlug: string;
  preselectedServiceId?: string;
  preselectedProfessionalId?: string;
}

export function PublicBookingPage({
  tenantSlug,
  preselectedServiceId,
  preselectedProfessionalId,
}: PublicBookingPageProps) {
  const tenantQuery = usePublicTenant(tenantSlug);
  const tenant = tenantQuery.data ?? null;
  const tenantReady = !tenantQuery.isLoading && !tenantQuery.isError && !!tenant;

  const servicesQuery = usePublicServices(tenantSlug, tenantReady);
  const professionalsQuery = usePublicProfessionals(tenantSlug, tenantReady);

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const professionals = useMemo(
    () => professionalsQuery.data ?? [],
    [professionalsQuery.data],
  );

  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState<string>(ANY_PRO);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [result, setResult] = useState<{
    bookingId: string;
    manageToken: string | null;
    duplicate: boolean;
    snapshot: {
      serviceId: string;
      resolvedProfessionalId: string | null;
      startsAt: string;
    };
  } | null>(null);
  const [preselectionApplied, setPreselectionApplied] = useState(false);

  // Apply URL preselection once both catalog lists have loaded.
  useEffect(() => {
    if (preselectionApplied) return;
    if (!servicesQuery.isSuccess || !professionalsQuery.isSuccess) return;
    const cleaned = validatePreselection({
      serviceId: preselectedServiceId,
      professionalId: preselectedProfessionalId,
      services,
      professionals,
    });
    if (cleaned.serviceId) setServiceId(cleaned.serviceId);
    if (cleaned.professionalId) setProfessionalId(cleaned.professionalId);
    setPreselectionApplied(true);
  }, [
    preselectionApplied,
    servicesQuery.isSuccess,
    professionalsQuery.isSuccess,
    preselectedServiceId,
    preselectedProfessionalId,
    services,
    professionals,
  ]);

  // Day strip — built client-side after mount so SSR/CSR markup matches.
  const [dayStrip, setDayStrip] = useState<DayCell[]>([]);
  useEffect(() => {
    setDayStrip(buildDayStrip(new Date(), DAY_STRIP_COUNT, tenant?.timezone));
  }, [tenant?.timezone]);

  const dateKey = useMemo(() => (date ? toDateKey(date) : ""), [date]);

  const slotMap = usePublicSlots({
    tenantSlug,
    serviceId,
    professionalId,
    date: dateKey,
    professionals,
  });

  useEffect(() => {
    setSlot("");
  }, [serviceId, professionalId, dateKey]);

  const createBooking = useCreateBooking();


  const canSubmit =
    !!serviceId &&
    !!dateKey &&
    !!slot &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    !createBooking.isPending &&
    !result;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const resolvedPro =
      professionalId === ANY_PRO
        ? resolveProfessionalForSlot(slotMap.bySlot, slot, preselectedProfessionalId)
        : professionalId;
    if (!resolvedPro) {
      toast.error("That time isn't available anymore. Please pick another.");
      setSlot("");
      return;
    }
    try {
      const res = await createBooking.mutateAsync({
        tenantSlug,
        professionalId: resolvedPro,
        serviceId,
        startsAt: slot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
      setResult({
        ...res,
        snapshot: {
          serviceId,
          resolvedProfessionalId: resolvedPro,
          startsAt: slot,
        },
      });
      if (res.duplicate) {
        toast.success("This booking was already submitted.");
      } else {
        toast.success("Booking confirmed.");
      }
    } catch (err) {
      if (err instanceof SlotTakenError) {
        toast.error("That time was just taken. Please pick another slot.");
        setSlot("");
      } else {
        toast.error(toUserMessage(err));
      }
    }
  }




  function resetForm() {
    setServiceId("");
    setProfessionalId(ANY_PRO);
    setDate(undefined);
    setSlot("");
    setCustomerName("");
    setCustomerPhone("");
    setResult(null);
  }

  // --- Loading / error / not-found ---
  if (tenantQuery.isLoading) {
    return (
      <PageShell>
        <DeviceFrame>
          <CenteredMessage>
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span className="text-sm text-muted-foreground">Loading…</span>
          </CenteredMessage>
        </DeviceFrame>
      </PageShell>
    );
  }
  if (tenantQuery.isError || !tenant) {
    return (
      <PageShell>
        <DeviceFrame>
          <CenteredMessage>
            <div className="mx-auto max-w-md p-8 text-center">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Booking page not found
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We couldn't find a workspace at this link. Double-check the URL with the
                business that shared it.
              </p>
            </div>
          </CenteredMessage>
        </DeviceFrame>
      </PageShell>
    );
  }

  const slotsReady = !!serviceId && !!dateKey;
  const slots = slotMap.slots;
  const selectedPro =
    professionalId !== ANY_PRO
      ? (professionals.find((p) => p.id === professionalId)?.name ?? null)
      : null;
  const ctaLabel = (() => {
    if (!slot) return "Confirm booking";
    const dayLabel = weekdayLong(slot, tenant.timezone);
    const time = formatSlotTime(slot, tenant.timezone);
    return `Confirm ${dayLabel} · ${time}`;
  })();

  const proPills = professionals.length > 1 && (
    <ProfessionalPills
      professionals={professionals}
      value={professionalId}
      onChange={setProfessionalId}
      isLoading={professionalsQuery.isLoading}
    />
  );

  return (
    <PageShell>
      <DeviceFrame statusPill={result ? "Booked · details confirmed" : null}>
        {result ? (
          <SuccessView
            tenant={tenant}
            result={result}
            services={services}
            professionals={professionals}
            onReset={resetForm}
          />

        ) : (
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            {/*
              Body scrolling:
              - <lg: single outer scroll (no nested scrollers, no scrollbar
                inside scrollbar). Both column groups flow naturally.
              - lg+: two side-by-side columns, each owns its own scroll.
            */}
            <div className="flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-0 lg:overflow-hidden">
              {/* Left column (lg+) / top stack on mobile/tablet */}
              <div className="flex flex-col gap-0 px-5 pt-6 sm:px-7 lg:h-full lg:overflow-y-auto lg:border-r lg:border-border lg:px-8 lg:pb-6 lg:pt-5">
                <IdentityHeader tenant={tenant} />
                <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                  Book your chair
                </h2>
                <ServiceList
                  services={services}
                  isLoading={servicesQuery.isLoading}
                  value={serviceId}
                  onChange={setServiceId}
                />
                <MetaStrip proName={selectedPro} tagline={tenant.tagline} />
              </div>

              {/* Right column (lg+) / continuation on mobile/tablet */}
              <div className="flex flex-col px-5 pb-5 sm:px-7 lg:h-full lg:overflow-y-auto lg:px-8 lg:pb-6 lg:pt-5">
                {proPills}
                <DayStrip
                  cells={dayStrip}
                  value={dateKey}
                  onPick={(key) => {
                    const [y, m, d] = key.split("-").map((n) => Number.parseInt(n, 10));
                    if (y && m && d) setDate(new Date(y, m - 1, d));
                  }}
                />
                <MoreDatesTrigger date={date} onPick={setDate} />
                <TimePills
                  slots={slots}
                  value={slot}
                  onPick={setSlot}
                  timezone={tenant.timezone}
                  ready={slotsReady}
                  isLoading={slotMap.isLoading}
                  disabledReason={slotMap.disabledReason}
                />
                <FormFields
                  name={customerName}
                  phone={customerPhone}
                  onName={setCustomerName}
                  onPhone={setCustomerPhone}
                />
              </div>
            </div>

            {/* Sticky CTA — full width across both columns */}
            <div className="border-t border-border bg-card px-5 py-4 sm:px-7 lg:px-8">
              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {createBooking.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {ctaLabel}
              </Button>
            </div>
          </form>
        )}
      </DeviceFrame>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

// TODO(tenant-theme): when `tenant.theme_preset` ships, replace the hard-coded
// `theme-sand-brass` class with `theme-${tenant.themePreset ?? "sand-brass"}`
// and load tokens from the public tenant profile.
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-sand-brass min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-between gap-6 px-0 py-0 sm:gap-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="hidden sm:block" />
        {children}
        <footer className="hidden flex-col items-center gap-2 pb-6 text-center sm:flex">
          <div className="h-px w-12 bg-accent/50" aria-hidden="true" />
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Powered by SchedlyOps
          </p>
        </footer>
      </div>
    </div>
  );
}

function DeviceFrame({
  children,
  statusPill,
}: {
  children: React.ReactNode;
  statusPill?: string | null;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      {statusPill && (
        <div className="absolute -top-3 right-4 z-10 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-foreground shadow-[var(--shadow-elegant)] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {statusPill}
        </div>
      )}
      {/*
        Three modes, breakpoint-driven:
        - mobile (<sm): full-bleed cream panel, no bezel
        - sm/md (>=sm, <lg): portrait tablet bezel
        - lg+: landscape tablet bezel with 2-column interior
      */}
      <div
        className={cn(
          // Mobile: full bleed, no bezel — locked to viewport height so the
          // sticky CTA always sits at the bottom of the screen.
          "h-[100dvh] w-full bg-card",
          // sm/md: portrait tablet bezel
          "sm:h-auto sm:w-[min(640px,calc(100vw-3rem))] sm:rounded-[2.5rem] sm:bg-foreground sm:p-3 sm:shadow-[var(--shadow-elegant)]",
          // lg+: landscape tablet, wider than tall
          "lg:w-[min(1120px,calc(100vw-4rem))] lg:rounded-[2rem] lg:p-4",
        )}
      >
        <div
          className={cn(
            "flex h-full flex-col sm:overflow-hidden sm:rounded-[2rem] sm:bg-card",
            // Portrait tablet height
            "sm:h-[min(820px,calc(100vh-6rem))]",
            // Landscape tablet height — wider than tall
            "lg:h-[min(700px,calc(100vh-8rem))] lg:rounded-[1.5rem]",
          )}
        >
          {/* Faux status row — desktop only, sells the device illusion */}
          <div className="hidden items-center justify-between px-6 pt-4 text-[11px] font-medium text-foreground/70 sm:flex lg:px-8">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-foreground/70" />
              <span className="h-1 w-1 rounded-full bg-foreground/70" />
              <span className="h-1 w-1 rounded-full bg-foreground/70" />
            </span>
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </div>
      {/* Mobile footer (outside the panel scroll) */}
      <footer className="flex flex-col items-center gap-2 bg-background py-5 text-center sm:hidden">
        <div className="h-px w-12 bg-accent/50" aria-hidden="true" />
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Powered by SchedlyOps
        </p>
      </footer>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[420px] flex-1 items-center justify-center gap-2">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function IdentityHeader({ tenant }: { tenant: PublicTenantProfile }) {
  const initials = deriveInitials(tenant.displayName);
  return (
    <header className="flex items-center gap-3">
      {tenant.logoUrl ? (
        <img
          src={tenant.logoUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-md object-cover lg:h-12 lg:w-12"
        />
      ) : (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-foreground text-[13px] font-semibold tracking-wider text-accent lg:h-12 lg:w-12">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-semibold text-foreground lg:text-lg">
          {tenant.displayName}
        </p>
        {tenant.tagline && (
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {tenant.tagline}
          </p>
        )}
      </div>
    </header>
  );
}

function ServiceList({
  services,
  isLoading,
  value,
  onChange,
}: {
  services: PublicService[];
  isLoading: boolean;
  value: string;
  onChange: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        Loading services…
      </div>
    );
  }
  if (services.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        No services available right now.
      </p>
    );
  }
  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-2",
        // Below lg the outer panel owns the scroll — no inner cap to avoid
        // nested scrollbars or clipping the first row. lg+ column scrolls.
        "lg:flex-1 lg:overflow-y-auto lg:pr-1",
      )}
      role="listbox"
      aria-label="Services"
    >
      {services.map((s) => {
        const selected = value === s.id;
        const price = formatPrice(s.priceCents);
        const duration = formatDuration(s.durationMinutes);
        return (
          <button
            key={s.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onChange(s.id)}
            className={cn(
              "group flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-all",
              "hover:border-accent/60 hover:bg-secondary/60",
              selected
                ? "border-accent bg-secondary shadow-[inset_3px_0_0_0_var(--accent)]"
                : "border-border",
            )}
          >
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
              {duration && (
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {duration}
                </span>
              )}
            </div>
            {price && (
              <span className="shrink-0 text-sm font-semibold text-foreground">{price}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MetaStrip({
  proName,
  tagline,
}: {
  proName: string | null;
  tagline: string | null;
}) {
  const left = proName ? `WITH ${proName}` : "WITH ANY PROFESSIONAL";
  return (
    <div className="mt-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      <span className="truncate">{left}</span>
      {tagline && (
        <>
          <span aria-hidden="true">·</span>
          <span className="truncate">{tagline}</span>
        </>
      )}
    </div>
  );
}

function ProfessionalPills({
  professionals,
  value,
  onChange,
  isLoading,
}: {
  professionals: PublicProfessional[];
  value: string;
  onChange: (id: string) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground lg:mt-0">
        <Loader2 className="h-3 w-3 animate-spin text-accent" />
        Loading staff…
      </div>
    );
  }
  return (
    <div className="mt-5 flex flex-wrap gap-2 lg:mt-0">
      <PillButton
        active={value === ANY_PRO}
        onClick={() => onChange(ANY_PRO)}
      >
        Any
      </PillButton>
      {professionals.map((p) => (
        <PillButton
          key={p.id}
          active={value === p.id}
          onClick={() => onChange(p.id)}
        >
          {p.name}
        </PillButton>
      ))}
    </div>
  );
}

function DayStrip({
  cells,
  value,
  onPick,
}: {
  cells: DayCell[];
  value: string;
  onPick: (key: string) => void;
}) {
  if (cells.length === 0) {
    return <div className="mt-4 h-[72px]" aria-hidden="true" />;
  }
  return (
    <div
      className={cn(
        "-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1",
        HIDE_SCROLLBAR,
      )}
    >
      {cells.map((c) => {
        const selected = value === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onPick(c.key)}
            className={cn(
              "flex min-w-[58px] flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 transition-all",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:border-accent/60 hover:bg-secondary/60",
            )}
            aria-pressed={selected}
          >
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.18em]",
                selected ? "text-background/80" : "text-muted-foreground",
              )}
            >
              {c.weekday}
            </span>
            <span className="text-base font-semibold">{c.day}</span>
          </button>
        );
      })}
    </div>
  );
}

function MoreDatesTrigger({
  date,
  onPick,
}: {
  date: Date | undefined;
  onPick: (d: Date | undefined) => void;
}) {
  return (
    <div className="mt-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <CalendarIcon className="h-3 w-3" />
            {date ? `Picked ${format(date, "PPP")}` : "Pick another date"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onPick}
            initialFocus
            disabled={(d) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return d < today;
            }}
            className="pointer-events-auto p-3"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TimePills({
  slots,
  value,
  onPick,
  timezone,
  ready,
  isLoading,
  disabledReason,
}: {
  slots: string[];
  value: string;
  onPick: (s: string) => void;
  timezone: string | null | undefined;
  ready: boolean;
  isLoading: boolean;
  disabledReason: string | null;
}) {
  let placeholder: string | null = null;
  if (!ready) placeholder = "Pick a service and date to see times";
  else if (disabledReason === "too_many_professionals")
    placeholder = "Please pick a specific professional";
  else if (isLoading) placeholder = "Loading times…";
  else if (slots.length === 0) placeholder = "No times available";

  return (
    <div className="mt-4">
      {placeholder ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {placeholder}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => {
            const selected = value === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onPick(s)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-all",
                  selected
                    ? "border-accent bg-secondary text-foreground shadow-[inset_0_0_0_1px_var(--accent)]"
                    : "border-border bg-card text-foreground hover:border-accent/60 hover:bg-secondary/60",
                )}
                aria-pressed={selected}
              >
                {formatSlotTime(s, timezone)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormFields({
  name,
  phone,
  onName,
  onPhone,
}: {
  name: string;
  phone: string;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pb-name" className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Your name
        </Label>
        <Input
          id="pb-name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          autoComplete="name"
          required
          className="bg-card"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pb-phone" className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Phone
        </Label>
        <Input
          id="pb-phone"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          required
          className="bg-card"
        />
      </div>
    </div>
  );
}

function SuccessView({
  tenant,
  result,
  services,
  professionals,
  onReset,
}: {
  tenant: PublicTenantProfile;
  result: {
    bookingId: string;
    manageToken: string | null;
    duplicate: boolean;
    snapshot: {
      serviceId: string;
      resolvedProfessionalId: string | null;
      startsAt: string;
    };
  };
  services: PublicService[];
  professionals: PublicProfessional[];
  onReset: () => void;
}) {
  const { snapshot } = result;
  const service = services.find((s) => s.id === snapshot.serviceId) ?? null;
  const professional = snapshot.resolvedProfessionalId
    ? (professionals.find((p) => p.id === snapshot.resolvedProfessionalId) ?? null)
    : null;

  const dateLabel = (() => {
    try {
      return new Intl.DateTimeFormat(PUBLIC_BOOKING_LOCALE, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: tenant.timezone || undefined,
      }).format(new Date(snapshot.startsAt));
    } catch {
      return snapshot.startsAt;
    }
  })();
  const timeLabel = formatSlotTime(snapshot.startsAt, tenant.timezone);
  const durationMin = service?.durationMinutes ?? 0;

  // Short reference: first 6 chars of UUID, uppercased. Never expose the full id.
  const shortRef = result.bookingId
    ? result.bookingId.replace(/-/g, "").slice(0, 6).toUpperCase()
    : null;

  // Only render tel: link when we have a phone that at least contains a digit.
  const phone = tenant.publicPhone?.trim() ?? "";
  const telHref = /\d/.test(phone) ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  const address = formatAddress([
    tenant.addressLine1,
    tenant.addressLine2,
    tenant.city,
    tenant.state,
    tenant.postalCode,
  ]);
  const mapsUrl = buildMapsUrl(address);

  function handleAddToCalendar() {
    const ics = buildIcs({
      uid: `${result.bookingId || shortRef || "booking"}@schedlyops`,
      startsAt: snapshot.startsAt,
      durationMinutes: durationMin,
      summary: `${service?.name ?? "Appointment"} @ ${tenant.displayName}`,
      location: address || null,
      description: professional?.name ? `With ${professional.name}` : null,
    });
    const filename = shortRef ? `appointment-${shortRef}.ics` : "appointment.ics";
    downloadIcs(ics, filename);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-5 sm:px-7 lg:px-8">
        <div className="mx-auto w-full max-w-lg">
          <IdentityHeader tenant={tenant} />
          <div className="mt-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-accent">
              {result.duplicate ? "Already submitted" : "Confirmed"}
            </p>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {result.duplicate ? "Already booked" : "You're booked!"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your appointment has been saved. Contact the shop directly if you need to
            make changes.
          </p>

          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Appointment details
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <SummaryRow label="Service" value={service?.name ?? "—"} />
              <SummaryRow
                label="With"
                value={professional?.name ?? "Any available professional"}
              />
              <SummaryRow label="Date" value={dateLabel} />
              <SummaryRow label="Time" value={timeLabel} />
              {durationMin > 0 && (
                <SummaryRow label="Duration" value={`${durationMin} min`} />
              )}
              {address && <SummaryRow label="Location" value={address} />}
              <SummaryRow label="Shop" value={tenant.displayName} />
            </dl>
            {shortRef && (
              <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                Ref <span className="font-mono tracking-wider">{shortRef}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-card px-5 py-4 sm:px-7 lg:px-8">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddToCalendar}
              className="w-full sm:flex-1"
            >
              Add to calendar
            </Button>
            {mapsUrl && (
              <Button
                asChild
                type="button"
                variant="outline"
                className="w-full sm:flex-1"
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  Get directions
                </a>
              </Button>
            )}
          </div>
          {telHref && (
            <Button
              asChild
              type="button"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              <a href={telHref}>Call shop</a>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            Book another
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}


function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-accent bg-secondary text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-accent/60 hover:text-foreground",
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
