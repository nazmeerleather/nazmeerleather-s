import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Bag — Nazmeer Leather Co." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotalCents, update, remove, count } = useCart();
  const shipping = subtotalCents >= 50000 || subtotalCents === 0 ? 0 : 2500;
  const total = subtotalCents + shipping;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 md:py-24">
        <h1 className="font-display text-5xl md:text-6xl">Your bag</h1>
        <p className="mt-2 text-muted-foreground text-sm">{count} {count === 1 ? "item" : "items"}</p>

        {items.length === 0 ? (
          <div className="mt-16 py-24 text-center border border-border">
            <p className="font-display text-2xl">Your bag is empty.</p>
            <Link to="/" className="mt-6 inline-block text-[11px] tracking-[0.28em] uppercase link-underline text-[color:var(--brand-cognac)]">
              Continue shopping →
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid lg:grid-cols-[1.5fr_1fr] gap-12">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((it) => (
                <li key={`${it.product_id}-${it.size ?? ""}`} className="py-6 flex gap-4">
                  {it.image_url && (
                    <img src={it.image_url} alt={it.product_name} className="w-24 h-32 object-cover bg-secondary" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg">{it.product_name}</h3>
                        {it.size && (
                          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">Size {it.size}</p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(it.product_id, it.size)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button
                          onClick={() => update(it.product_id, it.size, it.quantity - 1)}
                          className="p-2 hover:bg-secondary"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-4 text-sm tabular-nums">{it.quantity}</span>
                        <button
                          onClick={() => update(it.product_id, it.size, it.quantity + 1)}
                          className="p-2 hover:bg-secondary"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="tabular-nums">{formatMoney(it.unit_price_cents * it.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-32 lg:self-start bg-secondary p-8">
              <h2 className="font-display text-2xl">Order summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(subtotalCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">{shipping === 0 ? "Complimentary" : formatMoney(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(total)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="mt-8 block text-center py-4 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors"
              >
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}