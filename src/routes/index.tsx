import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroJacket from "@/assets/hero-jacket.jpg";
import catMen from "@/assets/category-men.jpg";
import catWomen from "@/assets/category-women.jpg";
import catGloves from "@/assets/category-gloves.jpg";
import catBigPacks from "@/assets/category-bigpacks.jpg";
import catCustomize from "@/assets/customize-craft.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[calc(100vh-9rem)]">
            <div className="flex items-center px-8 md:px-16 lg:px-24 py-20 order-2 lg:order-1">
              <div className="max-w-md">
                <div className="eyebrow">Autumn Collection · 2026</div>
                <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.95] text-foreground">
                  The heirloom<br />
                  <em className="text-[color:var(--brand-cognac)] not-italic font-normal">jacket.</em>
                </h1>
                <p className="mt-8 text-base text-muted-foreground leading-relaxed max-w-sm">
                  Full-grain leather, cut and hand-stitched by master artisans. Built to soften, patina and outlast a generation.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <Link
                    to="/"
                    className="inline-flex items-center h-12 px-8 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors"
                  >
                    Shop the collection
                  </Link>
                  <Link to="/" className="text-[11px] tracking-[0.28em] uppercase link-underline text-foreground">
                    Discover our craft →
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2 min-h-[60vh] lg:min-h-full bg-[color:var(--brand-espresso-deep)]">
              <img
                src={heroJacket}
                alt="Chiragh Leather Co. signature cognac biker jacket"
                width={1920}
                height={1200}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-8 right-8 text-[color:var(--brand-bone)]/70 text-[10px] tracking-[0.3em] uppercase">
                No. 01 — The Camden Biker
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES — asymmetric editorial grid */}
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-32">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="eyebrow">The Maison</div>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Shop by world</h2>
            </div>
            <Link to="/" className="hidden md:inline-block text-[11px] tracking-[0.28em] uppercase link-underline">
              All collections →
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-8">
            <CategoryCard className="col-span-12 md:col-span-7 aspect-[5/6]" src={catWomen} eyebrow="Women" title="Coats & Jackets" />
            <CategoryCard className="col-span-12 md:col-span-5 aspect-[4/6]" src={catMen} eyebrow="Men" title="Leather Outerwear" />
            <CategoryCard className="col-span-12 md:col-span-4 aspect-[4/5]" src={catGloves} eyebrow="Gloves" title="Motorcycle" />
            <CategoryCard className="col-span-12 md:col-span-8 aspect-[16/10]" src={catBigPacks} eyebrow="Big Packs" title="Duffles & Travel" />
          </div>
        </section>

        {/* CRAFT / CUSTOMIZE band */}
        <section className="mt-32">
          <div className="relative grid lg:grid-cols-2 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)]">
            <div className="relative min-h-[420px] lg:min-h-[600px]">
              <img
                src={catCustomize}
                alt="Master artisan hand-stitching cognac leather"
                loading="lazy"
                width={1600}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover opacity-95"
              />
            </div>
            <div className="flex items-center px-8 md:px-16 lg:px-24 py-20 lg:py-32">
              <div className="max-w-md">
                <div className="eyebrow text-[color:var(--brand-cognac-soft)]">Made to Measure</div>
                <h2 className="mt-6 font-display text-4xl md:text-5xl leading-[1] text-[color:var(--brand-bone)]">
                  Commission a piece,<br />
                  <em className="not-italic text-[color:var(--brand-cognac-soft)]">entirely yours.</em>
                </h2>
                <p className="mt-8 text-[color:var(--brand-bone)]/75 leading-relaxed">
                  Choose the hide, the lining, the hardware. Our atelier hand-crafts jackets and coats to your exact measurements — a process refined over three generations.
                </p>
                <Link
                  to="/"
                  className="mt-10 inline-flex items-center h-12 px-8 border border-[color:var(--brand-bone)]/40 text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] hover:border-[color:var(--brand-cognac)] transition-colors"
                >
                  Begin your commission
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Values / editorial pillars */}
        <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-32">
          <div className="grid md:grid-cols-3 gap-14 md:gap-20 text-center">
            <Pillar n="I" title="Full-grain hides" body="Sourced from a single European tannery working to our specification since 1978." />
            <Pillar n="II" title="Hand-stitched" body="Every seam saddle-stitched with waxed linen thread — stronger than any machine." />
            <Pillar n="III" title="Lifetime repair" body="We repair, recondition and reline every piece we make, for as long as it exists." />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryCard({
  src,
  eyebrow,
  title,
  className,
}: {
  src: string;
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <Link to="/" className={`group relative block overflow-hidden bg-[color:var(--brand-espresso-deep)] ${className ?? ""}`}>
      <img
        src={src}
        alt={`${eyebrow} — ${title}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--brand-espresso-deep)]/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-[color:var(--brand-bone)]">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[color:var(--brand-cognac-soft)]">
          {eyebrow}
        </div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h3 className="font-display text-2xl md:text-3xl leading-tight">{title}</h3>
          <span className="text-[11px] tracking-[0.28em] uppercase opacity-80 group-hover:opacity-100 transition-opacity">
            Shop →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Pillar({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-display italic text-2xl text-[color:var(--brand-cognac)]">{n}</div>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
