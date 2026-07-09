import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { listOrdersAdmin, updateOrderStatus, getOrderItemsAdmin } from "@/lib/orders.functions";
import { formatMoney } from "@/lib/format";

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
    <div>
      <h1 className="font-display text-4xl mb-8">Orders</h1>
      {loading ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="border border-border">
          {rows.map((o) => (
            <div key={o.id} className="border-b border-border last:border-b-0">
              <button onClick={() => toggle(o.id)} className="w-full grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 p-4 items-center text-left hover:bg-secondary/50">
                <div>
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.email}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  #{o.id.slice(0, 8).toUpperCase()}<br />
                  {new Date(o.created_at).toLocaleString()}
                </div>
                <div className="tabular-nums text-sm">{formatMoney(o.total_cents, o.currency)}</div>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className="border border-border bg-background px-3 py-1.5 text-xs tracking-[0.15em] uppercase"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-xs text-muted-foreground">{expanded === o.id ? "▲" : "▼"}</span>
              </button>
              {expanded === o.id && (
                <div className="p-6 bg-secondary/50 border-t border-border">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="eyebrow">Shipping</div>
                      <p className="mt-2 text-sm">
                        {o.address_line1}{o.address_line2 ? `, ${o.address_line2}` : ""}<br />
                        {o.city}{o.postal_code ? `, ${o.postal_code}` : ""}, {o.country}<br />
                        {o.phone}
                      </p>
                    </div>
                    <div>
                      <div className="eyebrow">Payment</div>
                      <p className="mt-2 text-sm capitalize">{o.payment_method.replace("_", " ")}</p>
                      {o.notes && <><div className="eyebrow mt-4">Notes</div><p className="mt-2 text-sm">{o.notes}</p></>}
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="eyebrow mb-3">Items</div>
                    <ul className="divide-y divide-border border-y border-border">
                      {(items[o.id] ?? []).map((it) => (
                        <li key={it.id} className="py-3 flex gap-4 text-sm">
                          {it.image_url && <img src={it.image_url} alt="" className="w-12 h-14 object-cover" />}
                          <div className="flex-1">
                            <div>{it.product_name}</div>
                            <div className="text-xs text-muted-foreground">{it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity}</div>
                          </div>
                          <div className="tabular-nums">{formatMoney(it.unit_price_cents * it.quantity, o.currency)}</div>
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