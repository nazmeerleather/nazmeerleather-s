import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { submitCustomRequest } from "@/lib/custom.functions";

const KINDS: Record<string, { label: string; measurements: string[] }> = {
  "mens-jackets": {
    label: "Men's Jacket",
    measurements: ["Chest", "Waist", "Shoulder", "Sleeve length", "Jacket length", "Bicep"],
  },
  "womens-jackets": {
    label: "Women's Jacket",
    measurements: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve length", "Jacket length"],
  },
  "womens-coats": {
    label: "Women's Coat",
    measurements: ["Bust", "Waist", "Hip", "Shoulder", "Sleeve length", "Coat length"],
  },
};

export const Route = createFileRoute("/customize/$kind")({
  loader: ({ params }) => {
    if (!KINDS[params.kind]) throw notFound();
  },
  head: ({ params }) => ({
    meta: [{ title: `Commission a ${KINDS[params.kind]?.label ?? "Piece"} — Nazmeer Leather Co.` }],
  }),
  errorComponent: ({ reset }) => <div className="p-20 text-center"><button onClick={reset} className="underline">Try again</button></div>,
  notFoundComponent: () => <div className="p-20 text-center">Not found</div>,
  component: CustomizeForm,
});

function CustomizeForm() {
  const { kind } = Route.useParams();
  const cfg = KINDS[kind]!;
  const submit = useServerFn(submitCustomRequest);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const measurements: Record<string, string> = {};
    for (const m of cfg.measurements) {
      const v = String(fd.get(`m_${m}`) ?? "");
      if (v) measurements[m] = v;
    }
    const payload = {
      kind: kind as "mens-jackets" | "womens-jackets" | "womens-coats",
      full_name: String(fd.get("full_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      country: (String(fd.get("country") ?? "") || null) as string | null,
      leather_type: (String(fd.get("leather_type") ?? "") || null) as string | null,
      color: (String(fd.get("color") ?? "") || null) as string | null,
      lining: (String(fd.get("lining") ?? "") || null) as string | null,
      hardware: (String(fd.get("hardware") ?? "") || null) as string | null,
      measurements,
      notes: (String(fd.get("notes") ?? "") || null) as string | null,
    };
    setSubmitting(true);
    try {
      await submit({ data: payload });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[900px] px-6 lg:px-10 py-16 md:py-24">
        <div className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
          <Link to="/customize" className="hover:text-foreground">Customize</Link>
          <span className="mx-2">/</span>{cfg.label}
        </div>
        <h1 className="mt-4 font-display text-5xl">Commission a {cfg.label}</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Share your preferences and measurements. Our atelier will follow up within 48 hours with a quote and next steps.
        </p>

        {done ? (
          <div className="mt-16 border border-border p-12 text-center">
            <h2 className="font-display text-3xl">Your request is with our atelier.</h2>
            <p className="mt-3 text-muted-foreground">We'll be in touch within 48 hours.</p>
            <Link to="/" className="mt-8 inline-block text-[11px] tracking-[0.28em] uppercase link-underline text-[color:var(--brand-cognac)]">
              Return home →
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 space-y-10">
            <Section title="Your details">
              <Field name="full_name" label="Full name" required />
              <div className="grid md:grid-cols-2 gap-4">
                <Field name="email" label="Email" type="email" required />
                <Field name="phone" label="Phone" required />
              </div>
              <Field name="country" label="Country" />
            </Section>

            <Section title="Specifications">
              <div className="grid md:grid-cols-2 gap-4">
                <Field name="leather_type" label="Preferred leather (e.g. lambskin, cognac full-grain)" />
                <Field name="color" label="Colour" />
                <Field name="lining" label="Lining" />
                <Field name="hardware" label="Hardware (brass, silver, gunmetal)" />
              </div>
            </Section>

            <Section title="Measurements (inches)">
              <div className="grid md:grid-cols-3 gap-4">
                {cfg.measurements.map((m) => (
                  <Field key={m} name={`m_${m}`} label={m} />
                ))}
              </div>
            </Section>

            <Section title="Anything else">
              <Field name="notes" label="Notes, references, inspiration" as="textarea" />
            </Section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-10 py-4 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit commission request"}
            </button>
          </form>
        )}
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

function Field({ name, label, type = "text", required, as }: { name: string; label: string; type?: string; required?: boolean; as?: "textarea" }) {
  const cls = "w-full bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground";
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-1.5">{label}{required && " *"}</span>
      {as === "textarea" ? <textarea name={name} rows={4} className={cls} /> : <input name={name} type={type} required={required} className={cls} />}
    </label>
  );
}