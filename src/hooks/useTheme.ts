import { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark" | "demo-barber";

export const THEME_STORAGE_KEY = "schedlyops.theme";
/** Demo Ready phase: Demo Barber is the default theme for demonstrations. */
export const DEFAULT_THEME: ThemeMode = "demo-barber";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
