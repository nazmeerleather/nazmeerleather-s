import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Package, User, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Nazmeer Leather Co." }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

type Order = {
  id: string;
  total_cents: number;
  status: string;
  created_at: string;
  currency: string;
};

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setAddress(user.user_metadata?.address || "");

      supabase
        .from("orders")
        .select("id, total_cents, status, created_at, currency")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setOrders(data || []);
          setLoadingOrders(false);
        });
    }
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone, address },
      });
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Profile Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-1/4">
            <h1 className="font-display text-3xl mb-8">My Account</h1>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h2 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 border-b border-border pb-2 mb-4">
                  <User className="h-3.5 w-3.5" /> Profile Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
                    <input 
                      type="text" 
                      value={user?.email || ""} 
                      disabled 
                      className="w-full border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 234 567 890"
                      className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Address</label>
                    <textarea 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your shipping address"
                      rows={3}
                      className="w-full border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-3 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.2em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <button 
              onClick={handleLogout}
              className="mt-8 flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </aside>

          {/* Orders Section */}
          <div className="flex-1 md:pl-12 md:border-l border-border">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 border-b border-border pb-2 mb-6">
              <Package className="h-3.5 w-3.5" /> Order History
            </h2>
            
            {loadingOrders ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border bg-muted/10">
                <p className="text-sm text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Link to="/" className="text-[11px] tracking-[0.2em] uppercase border-b border-foreground pb-0.5 hover:text-muted-foreground hover:border-muted-foreground transition-colors">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border hover:border-foreground/30 transition-colors">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                      <div className="text-sm font-medium">Order #{o.id.split("-")[0].toUpperCase()}</div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm">
                          {o.currency === "PKR" ? "Rs." : "$"} {(o.total_cents / 100).toLocaleString()}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                          {o.status.replace(/_/g, " ")}
                        </div>
                      </div>
                      <Link 
                        to={`/order/$id`} 
                        params={{ id: o.id }} 
                        className="text-[10px] tracking-wider uppercase border border-border px-3 py-1.5 hover:bg-muted transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
