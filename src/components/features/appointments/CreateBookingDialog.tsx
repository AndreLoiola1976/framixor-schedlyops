import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { availableSlotsKey } from "@/hooks/useAvailableSlots";
import { useSession } from "@/hooks/useSession";
import { IS_SUPABASE } from "@/lib/env";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useServices } from "@/hooks/useServices";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { useTenant } from "@/hooks/useTenant";
import { SlotTakenError } from "@/lib/booking-public";
import { toUserMessage } from "@/lib/scheduling-errors";

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

function toDateKey(d: Date): string {
  // Local YYYY-MM-DD (RPC expects a calendar date — no TZ shift).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatSlotTime(iso: string, timezone: string | undefined): string {
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

export function CreateBookingDialog({ open, onOpenChange }: Props) {
  const tenant = useTenant();
  const services = useServices();
  const professionals = useProfessionals();

  const [serviceId, setServiceId] = useState<string>("");
  const [professionalId, setProfessionalId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const dateKey = useMemo(() => (date ? toDateKey(date) : undefined), [date]);

  const activeServices = useMemo(() => services.filter((s) => s.active), [services]);
  const activeProfessionals = useMemo(
    () => professionals.filter((p) => p.active),
    [professionals],
  );

  const slotsQuery = useAvailableSlots({
    tenantSlug: tenant.slug || undefined,
    professionalId: professionalId || undefined,
    serviceId: serviceId || undefined,
    date: dateKey,
  });

  // Reset selected slot whenever any upstream input changes — the slot value
  // is only meaningful for the current (service, professional, date) triple.
  useEffect(() => {
    setSlot("");
  }, [serviceId, professionalId, dateKey]);

  const createBooking = useCreateBooking();

  function resetForm() {
    setServiceId("");
    setProfessionalId("");
    setDate(undefined);
    setSlot("");
    setCustomerName("");
    setCustomerPhone("");
  }

  function handleOpenChange(next: boolean) {
    if (!next && createBooking.isPending) return; // don't close mid-submit
    if (!next) resetForm();
    onOpenChange(next);
  }

  const canSubmit =
    !!tenant.slug &&
    !!serviceId &&
    !!professionalId &&
    !!dateKey &&
    !!slot &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    !createBooking.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createBooking.mutateAsync({
        tenantSlug: tenant.slug,
        professionalId,
        serviceId,
        startsAt: slot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });
      toast.success("Booking created");
      resetForm();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof SlotTakenError) {
        toast.error("This time is no longer available. Please choose another slot.");
        setSlot("");
      } else {
        toast.error(toUserMessage(err));
      }
    }
  }

  const slotsLoading = slotsQuery.isFetching;
  const slots = slotsQuery.data ?? [];
  const slotsReady = !!serviceId && !!professionalId && !!dateKey;

  // --- DEBUG: booking availability (remove after triage) ---
  const { session, loading: sessionLoading } = useSession();
  const debug = useMemo(() => {
    const selectedServiceFromList = services.find((s) => s.id === serviceId) ?? null;
    const selectedProfessionalFromList =
      professionals.find((p) => p.id === professionalId) ?? null;
    const browserTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown";

    const disabledReasons: string[] = [];
    if (!IS_SUPABASE) disabledReasons.push("not-supabase-mode");
    if (sessionLoading) disabledReasons.push("session-loading");
    if (!session?.user?.id) disabledReasons.push("no-session-user");
    if (!tenant.slug) disabledReasons.push("missing-tenantSlug");
    if (!professionalId) disabledReasons.push("missing-professionalId");
    if (!serviceId) disabledReasons.push("missing-serviceId");
    if (!dateKey) disabledReasons.push("missing-dateKey");
    const availabilityQueryEnabled = disabledReasons.length === 0;

    const payload =
      tenant.slug && professionalId && serviceId && dateKey
        ? {
            p_tenant_slug: tenant.slug,
            p_professional_id: professionalId,
            p_service_id: serviceId,
            p_date: dateKey,
          }
        : null;

    const isoWeekday = date ? ((date.getDay() + 6) % 7) + 1 : null;
    const weekdayName = date
      ? new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date)
      : null;

    return {
      form: {
        selectedServiceId: serviceId || null,
        selectedServiceName: selectedServiceFromList?.name ?? null,
        selectedProfessionalId: professionalId || null,
        selectedProfessionalName: selectedProfessionalFromList?.name ?? null,
        selectedDateRaw: date ? date.toISOString() : null,
        selectedDateKey: dateKey ?? null,
        browserTimezone,
        tenantId: tenant.id || null,
        tenantSlug: tenant.slug || null,
        tenantTimezone: tenant.timezone ?? null,
      },
      selectedServiceFromList,
      selectedProfessionalFromList,
      availability: {
        rpc: "scheduling.public_available_slots",
        queryKey: availableSlotsKey({
          tenantSlug: tenant.slug || undefined,
          professionalId: professionalId || undefined,
          serviceId: serviceId || undefined,
          date: dateKey,
        }),
        payload,
        availabilityQueryEnabled,
        availabilityQueryDisabledReason:
          disabledReasons.length === 0 ? null : disabledReasons.join(", "),
        status: slotsQuery.status,
        fetchStatus: slotsQuery.fetchStatus,
        isFetching: slotsQuery.isFetching,
        slotCount: slots.length,
        data: slots,
        error: slotsQuery.error
          ? {
              name: (slotsQuery.error as Error).name,
              message: (slotsQuery.error as Error).message,
            }
          : null,
      },
      supporting: {
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          durationMinutes: s.durationMinutes,
          active: s.active,
          professionalIds: s.professionalIds,
        })),
        professionals: professionals.map((p) => ({
          id: p.id,
          name: p.name,
          active: p.active,
          workingDays: p.workingDays,
          workingHours: p.workingHours,
        })),
        workingHours: "not loaded by modal",
        bookingsConflicts: "not loaded by modal",
      },
      weekday: {
        selectedDateKey: dateKey ?? null,
        jsGetDay: date ? date.getDay() : null,
        isoWeekday,
        weekdayName,
        backendWeekdayExpectation:
          "unknown — backend contract not documented in repo",
      },
    };
  }, [
    serviceId,
    professionalId,
    date,
    dateKey,
    services,
    professionals,
    tenant.id,
    tenant.slug,
    tenant.timezone,
    session?.user?.id,
    sessionLoading,
    slotsQuery.status,
    slotsQuery.fetchStatus,
    slotsQuery.isFetching,
    slotsQuery.error,
    slots,
  ]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[SCHEDLYOPS_BOOKING_AVAILABILITY_DEBUG]", debug);
  }, [debug]);

  const debugJson = useMemo(() => JSON.stringify(debug, null, 2), [debug]);
  // --- /DEBUG ---

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create booking</DialogTitle>
          <DialogDescription>
            Capture a phone booking. Availability and conflicts are checked by the server.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cb-service">Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger id="cb-service">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {activeServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cb-pro">Professional</Label>
              <Select value={professionalId} onValueChange={setProfessionalId}>
                <SelectTrigger id="cb-pro">
                  <SelectValue placeholder="Select professional" />
                </SelectTrigger>
                <SelectContent>
                  {activeProfessionals.map((p) => (
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
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cb-slot">Time slot</Label>
              <Select value={slot} onValueChange={setSlot} disabled={!slotsReady || slotsLoading}>
                <SelectTrigger id="cb-slot">
                  <SelectValue
                    placeholder={
                      !slotsReady
                        ? "Pick service, pro, and date"
                        : slotsLoading
                          ? "Loading slots…"
                          : slots.length === 0
                            ? "No slots available"
                            : "Select time"
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
              <Label htmlFor="cb-name">Customer name</Label>
              <Input
                id="cb-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cb-phone">Customer phone</Label>
              <Input
                id="cb-phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                inputMode="tel"
                autoComplete="off"
                required
              />
            </div>
          </div>

          {!tenant.slug && (
            <p className="text-xs text-destructive">
              No tenant resolved — sign in and ensure your account is linked to a workspace.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={createBooking.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createBooking.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
