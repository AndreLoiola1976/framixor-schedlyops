import { en, type Dictionary } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

export const locales: Record<Locale, { label: string; dictionary: Dictionary }> = {
  en: { label: "English", dictionary: en },
  es: { label: "Español", dictionary: es },
};

export const defaultLocale: Locale = "en";

export const localeList: Array<{ code: Locale; label: string }> = (
  Object.keys(locales) as Locale[]
).map((code) => ({ code, label: locales[code].label }));
