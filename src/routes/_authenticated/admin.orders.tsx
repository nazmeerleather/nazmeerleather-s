import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { listOrdersAdmin, updateOrderStatus, getOrderItemsAdmin } from "@/lib/orders.functions";
import { formatMoney } from "@/lib/format";
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, Search, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

type Order = Awaited<ReturnType<typeof listOrdersAdmin>>[number];

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function AdminOrders() {
  const list = useServerFn(listOrdersAdmin);
  const updateStatus = useServerFn(updateOrderStatus);
  const getItems = useServerFn(getOrderItemsAdmin);
  const [rows, setRows] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Awaited<ReturnType<typeof getOrderItemsAdmin>>>>({});
  const [loading, setLoading] = useState(true);

  const refresh = () => list().then((r) => { setRows(r); setLoading(false); });
  useEffect(() => { refresh(); }, []); // eslint-disable-line

  async function toggle(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!items[id]) {
      const r = await getItems({ data: { orderId: id } });
      setItems((cur) => ({ ...cur, [id]: r }));
    }
  }

  async function setStatus(id: string, status: string) {
    try {
      await updateStatus({ data: { id, status } });
      toast.success("Status updated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl">Orders</h1>
          <p className="mt-2 text-muted-foreground text-sm">Review, fulfill, and manage client orders.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[10px] tracking-widest uppercase text-muted-foreground animate-pulse">Loading orders...</div>
      ) : rows.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border bg-muted/10 flex flex-col items-center">
          <Package className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="border border-border/50 bg-background">
          {rows.map((o) => (
            <div key={o.id} className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/10">
              <button onClick={() => toggle(o.id)} className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 text-left gap-4">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="min-w-[120px]">
                    <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Order</div>
                    <div className="font-medium">#{o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Client</div>
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{o.email}</div>
                  </div>
                  <div className="sm:ml-auto text-left sm:text-right">
                    <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Total</div>
                    <div className="tabular-nums text-sm font-medium">{formatMoney(o.total_cents, o.currency)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                  <select
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                    className="flex-1 sm:flex-none border border-border bg-background px-3 py-2 text-[10px] tracking-[0.15em] uppercase focus:outline-none focus:border-[color:var(--brand-espresso)] transition-colors"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                  <div className="text-muted-foreground p-2">
                    {expanded === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </button>
              {expanded === o.id && (
                <div className="p-4 sm:p-6 bg-muted/20 border-t border-border/50 text-sm animate-in slide-in-from-top-2 duration-200">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                        <MapPin className="h-3.5 w-3.5" /> Shipping Address
                      </div>
                      <p className="mt-2 text-foreground/80 leading-relaxed">
                        {o.address_line1}{o.address_line2 ? `, ${o.address_line2}` : ""}<br />
                        {o.city}{o.postal_code ? `, ${o.postal_code}` : ""}, {o.country}<br />
                        <span className="text-muted-foreground mt-1 inline-block">{o.phone}</span>
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                        <CreditCard className="h-3.5 w-3.5" /> Payment & Notes
                      </div>
                      <p className="mt-2 text-foreground/80 capitalize">{o.payment_method.replace("_", " ")}</p>
                      {o.notes && (
                        <div className="mt-4 p-3 bg-background border border-border/50 text-sm">
                          <div className="text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Customer Note</div>
                          {o.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                      <Package className="h-3.5 w-3.5" /> Ordered Items
                    </div>
                    <ul className="divide-y divide-border/50 border border-border/50 bg-background rounded-sm overflow-hidden">
                      {items[o.id] === undefined ? (
                        <li className="py-8 text-center text-xs text-muted-foreground animate-pulse">Loading items...</li>
                      ) : (items[o.id] ?? []).length === 0 ? (
                        <li className="py-4 text-center text-xs text-muted-foreground">No items found.</li>
                      ) : (items[o.id] ?? []).map((it) => (
                        <li key={it.id} className="p-3 sm:p-4 flex gap-4 text-sm items-center hover:bg-muted/10 transition-colors">
                          {it.image_url ? (
                            <img src={it.image_url} alt="" className="w-12 h-14 object-cover border border-border/50" />
                          ) : (
                            <div className="w-12 h-14 bg-muted/30 border border-border/50 flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground opacity-50" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{it.product_name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                              {it.size ? `Size: ${it.size}` : "One Size"} • Qty: {it.quantity}
                            </div>
                          </div>
                          <div className="tabular-nums font-medium">
                            {formatMoney(it.unit_price_cents * it.quantity, o.currency)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}