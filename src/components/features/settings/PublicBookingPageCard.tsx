import { useEffect, useMemo, useState } from "react";
import { Check, Circle, Copy, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionCard } from "@/components/common/SectionCard";
import { useTenant } from "@/hooks/useTenant";
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { useServices } from "@/hooks/useServices";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useT } from "@/i18n/useT";
import { getPublicBookingUrl } from "@/lib/public-booking-url";
import {
  buildShareSnippets,
  computeReadiness,
  type ReadinessItem,
  type ShareChannel,
} from "@/lib/launch-kit";
import { cn } from "@/lib/utils";

export function PublicBookingPageCard() {
  const t = useT();
  const tenant = useTenant();
  const profileQuery = useTenantProfile();
  const services = useServices();
  const professionals = useProfessionals();

  // Computed on the client to avoid SSR/CSR mismatch when falling back to
  // window.location.origin.
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    setUrl(getPublicBookingUrl(tenant.slug));
  }, [tenant.slug]);

  // Heuristic: warn only when the resolved link is on a Lovable preview/editor
  // origin we've verified is login-gated. Any other origin (including the
  // published `*.lovable.app` host and future production hosts) is treated as
  // safe. Set VITE_PUBLIC_BOOKING_BASE_URL to override.
  const isPreviewOrigin = useMemo(() => {
    if (!url) return false;
    try {
      const h = new URL(url).hostname;
      return h.includes("lovableproject.com") || h.startsWith("id-preview--");
    } catch {
      return false;
    }
  }, [url]);

  const hasSlug = !!tenant.slug;
  const lk = t.settings.publicPage.launchKit;

  const displayName =
    profileQuery.data?.display_name?.trim() || tenant.name || "";

  const snippets = useMemo(
    () =>
      buildShareSnippets({
        name: displayName,
        url,
        templates: {
          instagram: lk.share.instagram.template,
          whatsapp: lk.share.whatsapp.template,
          googleBusiness: lk.share.googleBusiness.template,
        },
      }),
    [displayName, url, lk.share.instagram.template, lk.share.whatsapp.template, lk.share.googleBusiness.template],
  );

  const readiness = useMemo(
    () =>
      computeReadiness({
        displayName,
        activeServicesCount: services.filter((s) => s.active).length,
        activeProfessionalsCount: professionals.filter((p) => p.active).length,
        hasSlug,
      }),
    [displayName, services, professionals, hasSlug],
  );

  const onCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.settings.publicPage.copied);
    } catch {
      toast.error(t.settings.publicPage.copyFailed);
    }
  };

  const onCopySnippet = async (channel: ShareChannel) => {
    const text = snippets[channel];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(lk.copied);
    } catch {
      toast.error(lk.copyFailed);
    }
  };

  const shareRows: Array<{ channel: ShareChannel; label: string }> = [
    { channel: "instagram", label: lk.share.instagram.label },
    { channel: "whatsapp", label: lk.share.whatsapp.label },
    { channel: "googleBusiness", label: lk.share.googleBusiness.label },
  ];

  const checklistLabel: Record<ReadinessItem["id"], string> = {
    businessName: lk.checklist.businessName,
    activeService: lk.checklist.activeService,
    activeProfessional: lk.checklist.activeProfessional,
    bookingLink: lk.checklist.bookingLink,
    workingHours: lk.checklist.workingHours,
  };

  const progress = lk.progress
    .replace("{done}", String(readiness.doneCount))
    .replace("{total}", String(readiness.totalCount));

  return (
    <SectionCard title={t.settings.publicPage.title} description={t.settings.publicPage.subtitle}>
      {hasSlug ? (
        <div className="flex flex-col gap-4">
          {/* URL row — unchanged */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                {url || `…/book/${tenant.slug}`}
              </code>
            </div>
            {isPreviewOrigin && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-destructive">
                <p className="font-medium">
                  This link points to a preview environment.
                </p>
                <p className="mt-0.5 text-destructive/90">
                  Preview links may require a Lovable login and should not be shared
                  with real customers. Set{" "}
                  <code className="font-mono">VITE_PUBLIC_BOOKING_BASE_URL</code> to a
                  public production host before sharing.
                </p>
              </div>
            )}
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

          {/* Share snippets */}
          <Separator />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">{lk.shareTitle}</h3>
            <ul className="flex flex-col gap-2">
              {shareRows.map((row) => (
                <li
                  key={row.channel}
                  className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{row.label}</p>
                    <p className="truncate text-xs text-muted-foreground" title={snippets[row.channel]}>
                      {snippets[row.channel]}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopySnippet(row.channel)}
                    disabled={!url}
                    className="shrink-0 gap-1.5 self-start sm:self-center"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {t.settings.publicPage.copy}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Readiness checklist */}
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground">{lk.checklistTitle}</h3>
              <span className="text-xs text-muted-foreground">{progress}</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {readiness.items.map((item) => {
                const label = checklistLabel[item.id];
                const muted = !!item.future;
                const Icon = item.done ? Check : Circle;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      muted
                        ? "text-muted-foreground"
                        : item.done
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        item.done && !muted ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {muted ? (
                      <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {lk.comingSoon}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.settings.publicPage.noSlug}</p>
      )}
    </SectionCard>
  );
}
