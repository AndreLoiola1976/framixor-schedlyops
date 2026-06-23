import { createFileRoute } from "@tanstack/react-router";
import { PublicBookingPage } from "@/features/public-booking/components/PublicBookingPage";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/i;

type PublicBookingSearch = {
  service?: string;
  professional?: string;
};

export const Route = createFileRoute("/book/$tenantSlug")({
  validateSearch: (raw: Record<string, unknown>): PublicBookingSearch => {
    const out: PublicBookingSearch = {};
    const svc = typeof raw.service === "string" ? raw.service : undefined;
    const pro = typeof raw.professional === "string" ? raw.professional : undefined;
    if (svc && UUID_RE.test(svc)) out.service = svc;
    if (pro && UUID_RE.test(pro)) out.professional = pro;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Book an appointment — SchedlyOps" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicBookingRoute,
});

function PublicBookingRoute() {
  const { tenantSlug } = Route.useParams();
  const search = Route.useSearch();

  // Path-param guard — invalid slug shape → render not-found state inside the page,
  // never crash the route.
  const safeSlug = SLUG_RE.test(tenantSlug) ? tenantSlug : "";

  return (
    <PublicBookingPage
      tenantSlug={safeSlug}
      preselectedServiceId={search.service}
      preselectedProfessionalId={search.professional}
    />
  );
}
