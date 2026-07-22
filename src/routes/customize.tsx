import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import craftImg from "@/assets/customize-craft.jpg";

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Made to Measure — Nazmeer Leather Co." },
      { name: "description", content: "Commission a made-to-measure leather jacket or coat, entirely to your specifications." },
      { property: "og:title", content: "Made to Measure — Nazmeer Leather Co." },
      { property: "og:description", content: "Commission a bespoke leather jacket or coat, entirely to your specifications." },
    ],
  }),
  component: Customize,
});

const OPTIONS = [
  { slug: "mens-jackets", label: "Men's Jackets", desc: "Bespoke leather outerwear tailored to your measurements." },
  { slug: "womens-jackets", label: "Women's Jackets", desc: "Cropped and classic silhouettes, cut to your specifications." },
  { slug: "womens-coats", label: "Women's Coats", desc: "Full-length leather coats crafted to your exact proportions." },
];

function Customize() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative min-h-[60vh] grid lg:grid-cols-2 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)]">
          <div className="relative min-h-[360px]">
            <img src={craftImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex items-center px-8 md:px-16 lg:px-24 py-20">
            <div className="max-w-md">
              <div className="eyebrow text-[color:var(--brand-cognac-soft)]">Made to Measure</div>
              <h1 className="mt-6 font-display text-4xl md:text-5xl leading-tight text-[color:var(--brand-bone)]">
                Commission a piece,<br /><em className="not-italic text-[color:var(--brand-cognac-soft)]">entirely yours.</em>
              </h1>
              <p className="mt-8 text-[color:var(--brand-bone)]/75 leading-relaxed">
                Tell us what you want, and our atelier will bring it into being. Every commission is hand-cut and hand-stitched to your measurements over four to six weeks.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 lg:px-10 py-24">
          <div className="eyebrow">Choose a starting point</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">What would you like made?</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {OPTIONS.map((o) => (
              <Link
                key={o.slug}
                to="/customize/$kind"
                params={{ kind: o.slug }}
                className="group block border border-border p-8 hover:border-foreground transition-colors"
              >
                <h3 className="font-display text-2xl">{o.label}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{o.desc}</p>
                <span className="mt-8 inline-block text-[11px] tracking-[0.28em] uppercase text-[color:var(--brand-cognac)] group-hover:translate-x-1 transition-transform">
                  Begin →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}