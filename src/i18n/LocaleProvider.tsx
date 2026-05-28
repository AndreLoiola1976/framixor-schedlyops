import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { defaultLocale, locales, type Locale } from "./locales";

const STORAGE_KEY = "schedlyops.locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
});

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in locales) return stored as Locale;
  } catch {
    // ignore
  }
  const nav = typeof navigator !== "undefined" ? navigator.language : "";
  const short = nav.slice(0, 2).toLowerCase();
  if (short in locales) return short as Locale;
  return defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Hydrate from storage/browser after mount to keep SSR output stable.
  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
  );
}
