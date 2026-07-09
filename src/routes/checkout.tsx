import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { createOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Chiragh Leather Co." }] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotalCents, clear } = useCart();
  const shipping = subtotalCents >= 50000 ? 0 : 2500;
  const total = subtotalCents + shipping;
  const submit = useServerFn(createOrder);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"cod" | "bank_transfer">("cod");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_name: String(fd.get("customer_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address_line1: String(fd.get("address_line1") ?? ""),
      address_line2: (String(fd.get("address_line2") ?? "") || null) as string | null,
      city: String(fd.get("city") ?? ""),
      postal_code: (String(fd.get("postal_code") ?? "") || null) as string | null,
      country: String(fd.get("country") ?? ""),
      notes: (String(fd.get("notes") ?? "") || null) as string | null,
      payment_method: payment,
      items: items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        product_slug: i.product_slug,
        image_url: i.image_url,
        size: i.size,
        quantity: i.quantity,
        unit_price_cents: i.unit_price_cents,
      })),
    };
    setSubmitting(true);
    try {
      const res = await submit({ data: payload });
      clear();
      navigate({ to: "/order/$id", params: { id: res.orderId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 md:py-24">
        <h1 className="font-display text-5xl md:text-6xl">Checkout</h1>
        <form onSubmit={onSubmit} className="mt-12 grid lg:grid-cols-[1.5fr_1fr] gap-12">
          <div className="space-y-10">
            <Section title="Contact">
              <Field name="customer_name" label="Full name" required />
              <div className="grid md:grid-cols-2 gap-4">
                <Field name="email" label="Email" type="email" required />
                <Field name="phone" label="Phone" required />
              </div>
            </Section>
            <Section title="Delivery">
              <Field name="address_line1" label="Address" required />
              <Field name="address_line2" label="Apartment, suite (optional)" />
              <div className="grid md:grid-cols-3 gap-4">
                <Field name="city" label="City" required />
                <Field name="postal_code" label="Postal code" />
                <Field name="country" label="Country" required defaultValue="United States" />
              </div>
              <Field name="notes" label="Order notes (optional)" as="textarea" />
            </Section>
            <Section title="Payment">
              <div className="space-y-3">
                <PaymentOption
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  title="Cash on Delivery"
                  desc="Pay the courier in cash when your order arrives."
                />
                <PaymentOption
                  checked={payment === "bank_transfer"}
                  onChange={() => setPayment("bank_transfer")}
                  title="Bank Transfer"
                  desc="We'll email you our bank details after you place the order."
                />
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start bg-secondary p-8">
            <h2 className="font-display text-2xl">Order summary</h2>
            <ul className="mt-6 divide-y divide-border">
              {items.map((it) => (
                <li key={`${it.product_id}-${it.size ?? ""}`} className="py-3 flex gap-3 text-sm">
                  {it.image_url && <img src={it.image_url} alt="" className="w-14 h-16 object-cover" />}
                  <div className="flex-1">
                    <div className="font-display">{it.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity}
                    </div>
                  </div>
                  <div className="tabular-nums">{formatMoney(it.unit_price_cents * it.quantity)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatMoney(subtotalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Complimentary" : formatMoney(shipping)}</dd></div>
              <div className="flex justify-between text-base border-t border-border pt-3"><dt>Total</dt><dd className="tabular-nums">{formatMoney(total)}</dd></div>
            </dl>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="mt-8 block w-full text-center py-4 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors disabled:opacity-60"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl mb-6">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  as,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  as?: "textarea";
}) {
  const common = "w-full bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground";
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-1.5">{label}{required && " *"}</span>
      {as === "textarea" ? (
        <textarea name={name} rows={3} className={common} defaultValue={defaultValue} />
      ) : (
        <input name={name} type={type} required={required} defaultValue={defaultValue} className={common} />
      )}
    </label>
  );
}

function PaymentOption({ checked, onChange, title, desc }: { checked: boolean; onChange: () => void; title: string; desc: string }) {
  return (
    <label className={`block border p-4 cursor-pointer ${checked ? "border-foreground" : "border-border"}`}>
      <div className="flex items-center gap-3">
        <input type="radio" checked={checked} onChange={onChange} className="accent-[color:var(--brand-cognac)]" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="mt-2 ml-6 text-sm text-muted-foreground">{desc}</p>
    </label>
  );
}