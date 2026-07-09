import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/custom.functions";
import { claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Chiragh Leather Co." }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const [status, setStatus] = useState<"loading" | "admin" | "not-admin">("loading");
  const [claiming, setClaiming] = useState(false);
  const check = useServerFn(getMyAdminStatus);
  const claim = useServerFn(claimFirstAdmin);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    check()
      .then((r) => setStatus(r.isAdmin ? "admin" : "not-admin"))
      .catch(() => setStatus("not-admin"));
  }, [check]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (status === "not-admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="eyebrow">Restricted</div>
          <h1 className="mt-4 font-display text-3xl">This area is for administrators.</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            If you're setting up the store for the first time, you can claim the admin role now.
          </p>
          <button
            disabled={claiming}
            onClick={async () => {
              setClaiming(true);
              try {
                await claim();
                toast.success("You are now an admin.");
                setStatus("admin");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Unable to claim admin");
              } finally {
                setClaiming(false);
              }
            }}
            className="mt-8 px-8 py-3 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] disabled:opacity-60"
          >
            {claiming ? "Claiming…" : "Claim admin"}
          </button>
          <p className="mt-6 text-xs text-muted-foreground">
            Only works if no admin exists yet. Otherwise ask an existing admin to grant you access.
          </p>
          <div className="mt-8">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className="text-[11px] tracking-[0.28em] uppercase link-underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/custom", label: "Custom" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display tracking-[0.28em] text-sm">CHIRAGH · ADMIN</Link>
            <nav className="hidden md:flex gap-6">
              {tabs.map((t) => {
                const active = pathname === t.to || (t.to !== "/admin" && pathname.startsWith(t.to));
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`text-[11px] tracking-[0.28em] uppercase ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
        <Outlet />
      </main>
    </div>
  );
}