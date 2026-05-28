import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/i18n/useT";
import { localeList } from "@/i18n/locales";

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {localeList.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLocale(l.code)}
            className="flex items-center justify-between gap-2"
          >
            <span>{l.label}</span>
            {locale === l.code ? <Check className="h-4 w-4 opacity-70" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
