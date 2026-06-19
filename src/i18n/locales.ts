import { en, type Dictionary } from "./en";
import { es } from "./es";
import { ptBR } from "./pt-BR";

export type Locale = "en" | "es" | "pt-BR";

export const locales: Record<Locale, { label: string; dictionary: Dictionary }> = {
  en: { label: "English", dictionary: en },
  es: { label: "Español", dictionary: es },
  "pt-BR": { label: "Português (BR)", dictionary: ptBR },
};

export const defaultLocale: Locale = "en";

export const localeList: Array<{ code: Locale; label: string }> = (
  Object.keys(locales) as Locale[]
).map((code) => ({ code, label: locales[code].label }));
