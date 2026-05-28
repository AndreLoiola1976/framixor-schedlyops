import { useContext } from "react";
import { type Dictionary } from "./en";
import { LocaleContext } from "./LocaleProvider";
import { locales } from "./locales";

/**
 * Returns the active dictionary based on the current locale from LocaleContext.
 * Components access nested keys directly (`t.nav.dashboard`).
 */
export function useT(): Dictionary {
  const { locale } = useContext(LocaleContext);
  return locales[locale].dictionary;
}

export function useLocale() {
  return useContext(LocaleContext);
}
