import { activeTenant } from "@/config/tenant";

export function formatCurrency(cents: number, currency = activeTenant.currency, locale = activeTenant.locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatNumber(value: number, locale = activeTenant.locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, locale = activeTenant.locale): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatTime(iso: string, locale = activeTenant.locale): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string, locale = activeTenant.locale): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatLongDate(iso: string, locale = activeTenant.locale): string {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}
