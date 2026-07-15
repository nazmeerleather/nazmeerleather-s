import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, PenTool, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalCustom: number;
  revenueChange: number;
  ordersChange: number;
  customChange: number;
  recentOrders: any[];
  chartData: any[];
};

function AdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Fetch last 30 days orders
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: orders } = await supabase
          .from("orders")
          .select("total_cents, created_at, status")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true });
          
        const { count: customCount } = await supabase
          .from("custom_requests")
          .select("id", { count: "exact", head: true });

        const safeOrders = orders || [];
        
        let totalRev = 0;
        let chartDataMap: Record<string, number> = {};
        
        safeOrders.forEach(o => {
          if (o.status !== "cancelled") {
            totalRev += o.total_cents;
          }
          const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          chartDataMap[date] = (chartDataMap[date] || 0) + (o.total_cents / 100);
        });

        const chartData = Object.entries(chartDataMap).map(([date, amount]) => ({
          name: date,
          revenue: amount
        }));

        setStats({
          totalRevenue: totalRev,
          totalOrders: safeOrders.length,
          totalCustom: customCount || 0,
          revenueChange: 12.5, // Mocked for design
          ordersChange: 8.2, // Mocked for design
          customChange: -2.4, // Mocked for design
          recentOrders: safeOrders.slice(-5).reverse(), // Last 5
          chartData
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-[10px] tracking-widest uppercase text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-4xl">Dashboard Overview</h1>
          <p className="mt-2 text-muted-foreground text-sm">A summary of your atelier's performance over the last 30 days.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard 
          title="Total Revenue" 
          value={`Rs. ${(stats?.totalRevenue ? stats.totalRevenue / 100 : 0).toLocaleString()}`} 
          change={stats?.revenueChange} 
          icon={DollarSign} 
        />
        <MetricCard 
          title="Orders (30d)" 
          value={stats?.totalOrders.toString() || "0"} 
          change={stats?.ordersChange} 
          icon={ShoppingBag} 
        />
        <MetricCard 
          title="Custom Requests" 
          value={stats?.totalCustom.toString() || "0"} 
          change={stats?.customChange} 
          icon={PenTool} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border bg-background p-6">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-6">
            <Activity className="h-3.5 w-3.5" /> Revenue Overview
          </h2>
          <div className="h-[300px] w-full">
            {stats?.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-cognac, #9c6644)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--brand-cognac, #9c6644)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                    tickFormatter={(value) => `Rs.${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '0', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--brand-cognac, #9c6644)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Not enough data to display chart.</div>
            )}
          </div>
        </div>
        
        <div className="border border-border bg-background p-6 flex flex-col">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-6">
            <ShoppingBag className="h-3.5 w-3.5" /> Quick Actions
          </h2>
          <div className="flex flex-col gap-3 flex-1">
            <QuickActionLink to="/admin/products" title="Manage Catalog" desc="Add or update pieces" icon={Package} />
            <QuickActionLink to="/admin/orders" title="Fulfill Orders" desc="Review pending orders" icon={ShoppingBag} />
            <QuickActionLink to="/admin/custom" title="Custom Requests" desc="Review client commissions" icon={PenTool} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon }: { title: string; value: string; change?: number; icon: any }) {
  const isPositive = change && change > 0;
  return (
    <div className="border border-border bg-background p-6 flex flex-col transition-all hover:shadow-md hover:border-foreground/20">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{title}</h3>
        <div className="p-2 bg-muted/50 rounded-sm text-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <span className="font-display text-3xl">{value}</span>
        {change !== undefined && (
          <span className={`flex items-center text-[10px] font-medium tracking-wider ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

function QuickActionLink({ to, title, desc, icon: Icon }: { to: string; title: string; desc: string; icon: any }) {
  return (
    <Link to={to} className="group flex items-start gap-4 p-4 border border-border/50 hover:border-[color:var(--brand-espresso)] hover:bg-muted/10 transition-all">
      <div className="mt-1 p-2 bg-muted/50 group-hover:bg-[color:var(--brand-espresso)] group-hover:text-[color:var(--brand-bone)] transition-colors rounded-sm">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <h4 className="text-sm font-medium transition-colors group-hover:text-[color:var(--brand-espresso)]">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
    </Link>
  );
}