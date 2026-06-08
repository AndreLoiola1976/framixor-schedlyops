import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { TenantMismatchBanner } from "@/components/common/TenantMismatchBanner";
import { DevDiagnostics } from "@/components/common/DevDiagnostics";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { BookingDialogContext } from "@/hooks/useBookingDialog";
import { CreateBookingDialog } from "@/components/features/appointments/CreateBookingDialog";
import { useSession } from "@/hooks/useSession";
import { useTenant } from "@/hooks/useTenant";
import { IS_SUPABASE } from "@/lib/env";

function NotFoundComponent() {
  // Avoid LocaleProvider dependency here so this also renders cleanly during
  // SSR/error boundaries; copy is intentionally static English fallback.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SchedlyOps — Scheduling operations for service businesses" },
      {
        name: "description",
        content:
          "SchedlyOps is a modern scheduling workspace for beauty & wellness teams — manage appointments, services, professionals, and clients.",
      },
      {
        property: "og:title",
        content: "SchedlyOps — Scheduling operations for service businesses",
      },
      {
        property: "og:description",
        content: "Scheduling operations for modern service businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "SchedlyOps — Scheduling operations for service businesses",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            <AuthGate>
              <AppShell />
            </AuthGate>
            <Toaster />
            <DevDiagnostics />
          </TooltipProvider>
        </ThemeProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [bookingOpen, setBookingOpen] = useState(false);
  const { session } = useSession();
  const tenant = useTenant();
  const canCreate = IS_SUPABASE && !!session?.user?.id && !!tenant.slug;

  if (pathname === "/auth") {
    return <Outlet />;
  }
  return (
    <BookingDialogContext.Provider value={{ open: bookingOpen, setOpen: setBookingOpen }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <TenantMismatchBanner />
          <main className="flex-1 bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      {canCreate && (
        <CreateBookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
      )}
    </BookingDialogContext.Provider>
  );
}
