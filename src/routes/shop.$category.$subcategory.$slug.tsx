import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingBag, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProductBySlug } from "@/lib/products.functions";
import { formatMoney, titleCase } from "@/lib/format";
import { useCart } from "@/lib/cart";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/shop/$category/$subcategory/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
  },
  head: () => ({ meta: [{ title: "Product — Chiragh Leather Co." }] }),
  errorComponent: ({ reset }) => (
    <div className="p-20 text-center">
      <p>Unable to load this product.</p>
      <button onClick={reset} className="underline mt-4">Try again</button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-20 text-center font-display text-2xl">Product not found</div>
  ),
  component: ProductPage,
});

const SIZE_CHART = {
  headers: ["Size", "Chest (in)", "Waist (in)", "Shoulder (in)", "Sleeve (in)", "Length (in)"],
  rows: [
    ["XS", "34", "28", "16.5", "24.5", "26"],
    ["S", "36", "30", "17", "25", "26.5"],
    ["M", "38", "32", "17.5", "25.5", "27"],
    ["L", "40", "34", "18", "26", "27.5"],
    ["XL", "42", "36", "18.5", "26.5", "28"],
    ["XXL", "44", "38", "19", "27", "28.5"],
  ],
};

function ProductPage() {
  const { category, subcategory, slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const navigate = useNavigate();
  const { add } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const product = data!.product;
  const related = data!.related;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(hasSizes ? null : "one-size");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const relatedRef = useRef<HTMLDivElement>(null);

  const addToCart = () => {
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    add({
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      image_url: product.images?.[0] ?? null,
      size: hasSizes ? selectedSize : null,
      quantity: 1,
      unit_price_cents: product.price_cents,
    });
    toast.success("Added to bag");
  };

  const buyNow = () => {
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart();
    setTimeout(() => navigate({ to: "/checkout" }), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Editorial hero — product on gradient stage */}
      <section
        className="relative w-full"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.94 0.010 78) 0%, oklch(0.86 0.014 72) 100%)",
        }}
      >
        <div className="relative mx-auto max-w-[1600px] px-4 md:px-10 pt-8 pb-14 md:pt-12 md:pb-20">
          <div className="relative mx-auto flex items-center justify-center min-h-[62vh] md:min-h-[78vh]">
            {product.images?.[imgIdx] && (
              <img
                src={product.images[imgIdx]}
                alt={product.name}
                className="max-h-[70vh] md:max-h-[78vh] w-auto object-contain drop-shadow-[0_40px_60px_rgba(30,20,10,0.25)]"
              />
            )}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % product.images.length)}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/70 hover:bg-background flex items-center justify-center transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-[3px] transition-all ${
                    i === imgIdx ? "w-8 bg-foreground" : "w-4 bg-foreground/25 hover:bg-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info panel */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-14 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1fr_420px] gap-14 lg:gap-24">
          {/* Left column — details */}
          <div>
            <div className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
              {titleCase(subcategory)}
            </div>
            <h1 className="mt-3 font-display text-3xl md:text-4xl leading-[1.05]">{product.name}</h1>
            <p className="mt-5 text-lg tabular-nums">
              {formatMoney(product.price_cents, product.currency)}
            </p>

            {product.images.length > 1 && (
              <div className="mt-8">
                <div className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground mb-3">
                  Variations
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.images.map((im, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`relative h-16 w-16 overflow-hidden border transition ${
                        i === imgIdx
                          ? "border-foreground ring-1 ring-foreground"
                          : "border-border hover:border-foreground/60"
                      }`}
                    >
                      <img src={im} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSizes && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] tracking-[0.32em] uppercase">Size</span>
                  <button
                    className="text-[10px] tracking-[0.32em] uppercase underline underline-offset-4 hover:text-[color:var(--brand-cognac)]"
                    onClick={() => setShowSizeChart((v) => !v)}
                  >
                    Size guide
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 max-w-md">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-11 border text-sm transition ${
                        selectedSize === sz
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {showSizeChart && (
                  <div className="mt-6 overflow-x-auto border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary">
                        <tr>
                          {SIZE_CHART.headers.map((h) => (
                            <th
                              key={h}
                              className="text-left px-3 py-2 text-[10px] tracking-[0.24em] uppercase font-medium"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SIZE_CHART.rows.map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            {r.map((c, j) => (
                              <td key={j} className="px-3 py-2 tabular-nums">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mt-14 border-t border-border pt-10">
              <h2 className="text-[10px] tracking-[0.32em] uppercase font-medium">
                Product description
              </h2>
              <p className="mt-5 text-sm leading-[1.9] text-foreground/80 whitespace-pre-line max-w-2xl">
                {product.description}
              </p>
            </div>

            {/* Accordion sections */}
            <div className="mt-10 divide-y divide-border border-y border-border max-w-2xl">
              {[
                {
                  id: "details",
                  title: "Product details",
                  body: (
                    <ul className="space-y-2 text-sm text-foreground/80">
                      <li>Full-grain vegetable-tanned leather</li>
                      <li>Hand-stitched with waxed linen thread</li>
                      <li>Solid brass hardware, hand-polished</li>
                      <li>Made in our Sialkot atelier</li>
                    </ul>
                  ),
                },
                {
                  id: "materials",
                  title: "Materials & care",
                  body: (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Wipe gently with a soft, dry cloth. Recondition every 6–12 months with a
                      neutral leather balm. Store filled with tissue in the dust bag provided.
                      Avoid prolonged exposure to direct sunlight and moisture.
                    </p>
                  ),
                },
                {
                  id: "commitment",
                  title: "Our commitment",
                  body: (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Every piece carries our lifetime repair and reconditioning promise.
                      Sourced responsibly, made by hand, built to be inherited.
                    </p>
                  ),
                },
              ].map((s) => {
                const open = openSection === s.id;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => setOpenSection(open ? null : s.id)}
                      className="flex w-full items-center justify-between py-5 text-left"
                    >
                      <span className="text-[11px] tracking-[0.28em] uppercase font-medium">
                        {s.title}
                      </span>
                      {open ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                    {open && <div className="pb-6 pr-8">{s.body}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column — sticky purchase panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <button
              onClick={addToCart}
              className="w-full h-14 bg-[color:var(--brand-espresso-deep)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.32em] uppercase flex items-center justify-center gap-3 hover:bg-[color:var(--brand-cognac)] transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to bag
            </button>
            <button
              onClick={buyNow}
              className="mt-3 w-full h-14 border border-foreground text-[11px] tracking-[0.32em] uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              Buy now
            </button>

            <div className="mt-8 space-y-5 text-sm">
              <div className="flex gap-3">
                <Truck className="h-4 w-4 mt-[3px] shrink-0" />
                <p className="text-foreground/80 leading-relaxed">
                  Complimentary worldwide shipping. Estimated delivery{" "}
                  <span className="font-medium">3–7 business days</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <RotateCcw className="h-4 w-4 mt-[3px] shrink-0" />
                <p className="text-foreground/80 leading-relaxed">
                  Complimentary exchanges & returns within 30 days.
                </p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="h-4 w-4 mt-[3px] shrink-0" />
                <p className="text-foreground/80 leading-relaxed">
                  Lifetime repair and reconditioning included.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border space-y-3">
              <a className="block text-sm underline underline-offset-4 hover:text-[color:var(--brand-cognac)]" href="#">
                Order by phone
              </a>
              <a className="block text-sm underline underline-offset-4 hover:text-[color:var(--brand-cognac)]" href="#">
                Book a private appointment
              </a>
              <Link
                to="/customize"
                className="block text-sm underline underline-offset-4 hover:text-[color:var(--brand-cognac)]"
              >
                Chiragh Bespoke services
              </Link>
            </div>
          </aside>
        </div>

        {/* Breadcrumbs — footer style, à la Gucci */}
        <nav className="mt-24 flex justify-center text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-3">/</span>
          <Link
            to="/shop/$category/$subcategory"
            params={{ category, subcategory }}
            className="hover:text-foreground underline underline-offset-4"
          >
            {titleCase(subcategory)}
          </Link>
        </nav>
      </section>

      {/* You may also like — horizontal editorial carousel */}
      {related.length > 0 && (
        <section className="border-t border-border py-20 md:py-24">
          <div className="text-center">
            <h2 className="text-[11px] tracking-[0.32em] uppercase font-medium">You may also like</h2>
          </div>

          <div className="relative mt-12">
            <button
              onClick={() => relatedRef.current?.scrollBy({ left: -600, behavior: "smooth" })}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-background border border-border items-center justify-center hover:border-foreground transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => relatedRef.current?.scrollBy({ left: 600, behavior: "smooth" })}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-background border border-border items-center justify-center hover:border-foreground transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={relatedRef}
              className="flex gap-6 md:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-6 md:px-16 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/shop/$category/$subcategory/$slug"
                  params={{
                    category: p.category_slug,
                    subcategory: p.subcategory_slug,
                    slug: p.slug,
                  }}
                  className="group shrink-0 snap-start w-[75vw] sm:w-[45vw] md:w-[32vw] lg:w-[24vw]"
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, oklch(0.96 0.008 78) 0%, oklch(0.90 0.012 72) 100%)",
                    }}
                  >
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="mt-5 text-center">
                    <h3 className="text-sm">{p.name}</h3>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      {formatMoney(p.price_cents, p.currency ?? "USD")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}