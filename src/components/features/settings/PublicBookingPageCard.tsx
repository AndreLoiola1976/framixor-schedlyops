import { useEffect, useState } from "react";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/SectionCard";
import { useTenant } from "@/hooks/useTenant";
import { useT } from "@/i18n/useT";
import { getPublicBookingUrl } from "@/lib/public-booking-url";

export function PublicBookingPageCard() {
  const t = useT();
  const tenant = useTenant();
  // Computed on the client to avoid SSR/CSR mismatch when falling back to
  // window.location.origin.
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    setUrl(getPublicBookingUrl(tenant.slug));
  }, [tenant.slug]);

  const hasSlug = !!tenant.slug;

  const onCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.settings.publicPage.copied);
    } catch {
      toast.error(t.settings.publicPage.copyFailed);
    }
  };

  return (
    <SectionCard title={t.settings.publicPage.title} description={t.settings.publicPage.subtitle}>
      {hasSlug ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
              {url || `…/book/${tenant.slug}`}
            </code>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCopy}
              disabled={!url}
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              {t.settings.publicPage.copy}
            </Button>
            <Button size="sm" asChild={!!url} disabled={!url} className="gap-1.5">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.settings.publicPage.open}
                </a>
              ) : (
                <span>
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t.settings.publicPage.open}
                </span>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.settings.publicPage.noSlug}</p>
      )}
    </SectionCard>
  );
}
