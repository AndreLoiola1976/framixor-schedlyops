import { Check, Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useT } from "@/i18n/useT";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useT();

  const options: Array<{ value: ThemeMode; label: string; Icon: typeof Sun }> = [
    { value: "light", label: t.topbar.theme.light, Icon: Sun },
    { value: "dark", label: t.topbar.theme.dark, Icon: Moon },
    { value: "demo-barber", label: t.topbar.theme.demoBarber, Icon: Sparkles },
  ];

  const active = options.find((o) => o.value === theme) ?? options[2];
  const ActiveIcon = active.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.topbar.theme.label}>
          <ActiveIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {options.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 opacity-70" />
              {label}
            </span>
            {theme === value ? <Check className="h-4 w-4 opacity-70" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
