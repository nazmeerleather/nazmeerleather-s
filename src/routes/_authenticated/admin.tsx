import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Package, ShoppingBag, PenTool, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Nazmeer Leather Co." }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
    if (!loading && user && !isAdmin) {
      navigate({ to: "/account" });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Redirecting…</div>;
  }

  const tabs = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/custom", label: "Custom", icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display tracking-[0.2em] text-sm hover:opacity-70 transition-opacity">NAZMEER ATELIER</Link>
            <nav className="hidden md:flex gap-1">
              {tabs.map((t) => {
                const active = pathname === t.to || (t.to !== "/admin" && pathname.startsWith(t.to));
                const Icon = t.icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-colors rounded-sm ${active ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
        {/* Mobile Navigation */}
        <nav className="md:hidden flex overflow-x-auto border-t border-border px-4 py-2 gap-2 scrollbar-hide">
          {tabs.map((t) => {
            const active = pathname === t.to || (t.to !== "/admin" && pathname.startsWith(t.to));
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] tracking-[0.15em] uppercase whitespace-nowrap rounded-sm ${active ? "bg-muted/50 text-foreground" : "text-muted-foreground"}`}
              >
                <Icon className="h-3 w-3" />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      
      {/* Main Content Area */}
      <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
        <Outlet />
      </main>
    </div>
  );
}