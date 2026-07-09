import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Account — Chiragh Leather Co." }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. You are signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[440px] px-6 py-24">
        <div className="text-center">
          <div className="eyebrow">Account</div>
          <h1 className="mt-4 font-display text-4xl">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
        </div>
        <form onSubmit={onSubmit} className="mt-12 space-y-4">
          <label className="block">
            <span className="block text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-1.5">Email</span>
            <input name="email" type="email" required className="w-full border border-border px-4 py-3 text-sm bg-transparent focus:outline-none focus:border-foreground" />
          </label>
          <label className="block">
            <span className="block text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-1.5">Password</span>
            <input name="password" type="password" required minLength={6} className="w-full border border-border px-4 py-3 text-sm bg-transparent focus:outline-none focus:border-foreground" />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-4 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="underline text-foreground"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}