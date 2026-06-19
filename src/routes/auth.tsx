import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { IS_SUPABASE } from "@/lib/env";
import { getSupabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";
import { useT } from "@/i18n/useT";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SchedlyOps" },
      { name: "description", content: "Sign in to the SchedlyOps operator console." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!IS_SUPABASE) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await getSupabase().auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        return;
      }
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">{t.auth.title}</h1>
              <p className="text-xs text-muted-foreground">{t.auth.subtitle}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
