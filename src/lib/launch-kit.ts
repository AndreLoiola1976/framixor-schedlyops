/**
 * Pure helpers for the Settings → "Your booking page" launch kit.
 * No React, no I/O — safe to unit test.
 */

export type ShareChannel = "instagram" | "whatsapp" | "googleBusiness";

export interface ShareSnippetTemplates {
  instagram: string;
  whatsapp: string;
  googleBusiness: string;
}

export interface BuildShareSnippetsInput {
  name: string;
  url: string;
  templates: ShareSnippetTemplates;
}

/**
 * Interpolate `{name}` and `{url}` into each localized template.
 * Unknown placeholders are left alone so missing data is visible, not silently
 * dropped.
 */
export function buildShareSnippets({
  name,
  url,
  templates,
}: BuildShareSnippetsInput): Record<ShareChannel, string> {
  const render = (tpl: string) =>
    tpl.replaceAll("{name}", name || "").replaceAll("{url}", url || "").trim();
  return {
    instagram: render(templates.instagram),
    whatsapp: render(templates.whatsapp),
    googleBusiness: render(templates.googleBusiness),
  };
}

export type ReadinessItemId =
  | "businessName"
  | "activeService"
  | "activeProfessional"
  | "bookingLink"
  | "workingHours";

export interface ReadinessItem {
  id: ReadinessItemId;
  done: boolean;
  /** Future items are rendered muted and excluded from `doneCount`/`totalCount`. */
  future?: boolean;
}

export interface ComputeReadinessInput {
  displayName: string | null | undefined;
  activeServicesCount: number;
  activeProfessionalsCount: number;
  hasSlug: boolean;
}

export interface ReadinessResult {
  items: ReadinessItem[];
  doneCount: number;
  totalCount: number;
}

export function computeReadiness(input: ComputeReadinessInput): ReadinessResult {
  const items: ReadinessItem[] = [
    { id: "businessName", done: !!input.displayName && input.displayName.trim().length > 0 },
    { id: "activeService", done: input.activeServicesCount > 0 },
    { id: "activeProfessional", done: input.activeProfessionalsCount > 0 },
    { id: "bookingLink", done: input.hasSlug },
    // Per-professional working hours: signal isn't reliable yet.
    { id: "workingHours", done: false, future: true },
  ];
  const counted = items.filter((i) => !i.future);
  return {
    items,
    doneCount: counted.filter((i) => i.done).length,
    totalCount: counted.length,
  };
}
