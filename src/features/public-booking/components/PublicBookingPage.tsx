import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SlotTakenError } from "@/lib/booking-public";
import { toUserMessage } from "@/lib/scheduling-errors";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { usePublicTenant } from "../hooks/usePublicTenant";
import {
  usePublicProfessionals,
  usePublicServices,
} from "../hooks/usePublicCatalog";
import {
  resolveProfessionalForSlot,
  usePublicSlots,
} from "../hooks/usePublicSlots";
import { validatePreselection } from "../lib/validatePreselection";

const ANY_PRO = "any";

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatSlotTime(iso: string, timezone: string | null | undefined): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return iso;
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

  const services = servicesQuery.data ?? [];
  const professionals = professionalsQuery.data ?? [];

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

  const manageUrl = useMemo(() => {
    if (!result?.manageToken) return null;
    if (typeof window === "undefined") return `/b/${result.manageToken}`;
    return `${window.location.origin}/b/${result.manageToken}`;
  }, [result]);

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
    // Resolve professional id (for "any" → pick from fan-out map).
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
      setResult(res);
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

  async function copyManageLink() {
    if (!manageUrl) return;
    try {
      await navigator.clipboard.writeText(manageUrl);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy link.");
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

  // --- Loading / error / not-found gating ---
  if (tenantQuery.isLoading) {
    return (
      <PageShell>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PageShell>
    );
  }
  if (tenantQuery.isError || !tenant) {
    return (
      <PageShell>
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Booking page not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't find a workspace at this link. Double-check the URL with the business that
            shared it.
          </p>
        </div>
      </PageShell>
    );
  }

  const slotsReady = !!serviceId && !!dateKey;
  const slots = slotMap.slots;

  return (
    <PageShell>
      <div className="w-full max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {tenant.displayName}
          </h1>
          {tenant.tagline && (
            <p className="mt-1 text-sm text-muted-foreground">{tenant.tagline}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">Book your appointment online.</p>
        </header>

        {result ? (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">
              {result.duplicate ? "Already booked" : "You're booked!"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.duplicate
                ? "This booking was already submitted. Use the manage link below if you need to make changes."
                : "We've saved your appointment. Save the manage link below to make changes later."}
            </p>
            <div className="mt-4 rounded border border-border bg-muted/30 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking ID</p>
              <p className="mt-1 font-mono text-xs break-all">{result.bookingId || "—"}</p>
            </div>
            {manageUrl ? (
              <div className="mt-3 rounded border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Manage link
                </p>
                <div className="mt-1 flex items-start gap-2">
                  <code className="flex-1 break-all rounded bg-background/60 p-1.5 text-xs">
                    {manageUrl}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={copyManageLink}
                    className="shrink-0"
                  >
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  This link is shown only once — save it now.
                </p>
              </div>
            ) : null}
            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                Book another
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pb-service">Service</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger id="pb-service">
                    <SelectValue
                      placeholder={servicesQuery.isLoading ? "Loading…" : "Choose a service"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pb-pro">Professional</Label>
                <Select value={professionalId} onValueChange={setProfessionalId}>
                  <SelectTrigger id="pb-pro">
                    <SelectValue
                      placeholder={
                        professionalsQuery.isLoading ? "Loading…" : "Any professional"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_PRO}>Any professional</SelectItem>
                    {professionals.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return d < today;
                      }}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pb-slot">Time</Label>
                <Select
                  value={slot}
                  onValueChange={setSlot}
                  disabled={!slotsReady || slotMap.isLoading}
                >
                  <SelectTrigger id="pb-slot">
                    <SelectValue
                      placeholder={
                        !slotsReady
                          ? "Pick a service and date first"
                          : slotMap.disabledReason === "too_many_professionals"
                            ? "Please pick a specific professional"
                            : slotMap.isLoading
                              ? "Loading times…"
                              : slots.length === 0
                                ? "No times available"
                                : "Pick a time"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatSlotTime(s, tenant.timezone)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pb-name">Your name</Label>
                <Input
                  id="pb-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pb-phone">Phone</Label>
                <Input
                  id="pb-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={!canSubmit}>
                {createBooking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm booking
              </Button>
            </div>
          </form>
        )}

        <footer className="mt-6 text-center text-xs text-muted-foreground">
          Powered by SchedlyOps
        </footer>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-10 sm:py-16">
      {children}
    </div>
  );
}
