import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getOrderById } from "@/lib/orders.functions";
import { formatMoney } from "@/lib/format";

const orderQuery = (id: string) =>
  queryOptions({ queryKey: ["order", id], queryFn: () => getOrderById({ data: { id } }) });

export const Route = createFileRoute("/order/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderQuery(params.id)),
  head: () => ({ meta: [{ title: "Order confirmed — Nazmeer Leather Co." }, { name: "robots", content: "noindex" }] }),
  errorComponent: ({ reset }) => (
    <div className="p-20 text-center"><p>Unable to load order.</p><button onClick={reset} className="underline mt-4">Try again</button></div>
  ),
  notFoundComponent: () => <div className="p-20 text-center">Order not found</div>,
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(orderQuery(id));
  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="p-20 text-center font-display text-2xl">Order not found</div>
        <SiteFooter />
      </div>
    );
  }
  const { order, items } = data;
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[800px] px-6 lg:px-10 py-16 md:py-24">
        <div className="text-center">
          <div className="eyebrow">Thank you</div>
          <h1 className="mt-4 font-display text-5xl md:text-6xl">Your order is confirmed.</h1>
          <p className="mt-4 text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()} · A confirmation has been sent to {order.email}.</p>
        </div>

        <div className="mt-16 border border-border">
          <div className="p-6 border-b border-border">
            <div className="eyebrow">Shipping to</div>
            <p className="mt-2 text-sm">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">
              {order.address_line1}
              {order.address_line2 ? `, ${order.address_line2}` : ""}<br />
              {order.city}{order.postal_code ? `, ${order.postal_code}` : ""}, {order.country}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="p-6 flex gap-4">
                {it.image_url && <img src={it.image_url} alt="" className="w-16 h-20 object-cover bg-secondary" />}
                <div className="flex-1">
                  <div className="font-display">{it.product_name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity}
                  </div>
                </div>
                <div className="tabular-nums">{formatMoney(it.unit_price_cents * it.quantity, order.currency)}</div>
              </li>
            ))}
          </ul>
          <dl className="p-6 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatMoney(order.subtotal_cents, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{order.shipping_cents === 0 ? "Complimentary" : formatMoney(order.shipping_cents, order.currency)}</dd></div>
            <div className="flex justify-between text-base border-t border-border pt-3"><dt>Total</dt><dd className="tabular-nums">{formatMoney(order.total_cents, order.currency)}</dd></div>
          </dl>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-[11px] tracking-[0.28em] uppercase link-underline text-[color:var(--brand-cognac)]">
            Continue shopping →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}