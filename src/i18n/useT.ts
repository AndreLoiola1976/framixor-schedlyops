import { en, type Dictionary } from "./en";

/**
 * Tiny placeholder for a future i18n library.
 * Today it just returns the English dictionary.
 * Components import `t` and access nested keys directly (`t.nav.dashboard`).
 */
export function useT(): Dictionary {
  return en;
}
