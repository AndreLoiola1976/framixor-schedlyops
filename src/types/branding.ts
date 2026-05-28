export interface Branding {
  name: string;
  logoInitials: string;
  /** CSS color values (e.g. `oklch(...)`). Written to CSS custom properties at runtime. */
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
}
