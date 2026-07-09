import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
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
      <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
        <div className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop/$category/$subcategory" params={{ category, subcategory }} className="hover:text-foreground">
            {titleCase(subcategory)}
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
              {product.images?.[imgIdx] && (
                <img
                  src={product.images[imgIdx]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 right-4 text-[11px] tracking-[0.28em] uppercase bg-background/80 px-3 py-1">
                {imgIdx + 1} / {product.images.length}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.slice(0, 4).map((im, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`relative aspect-square w-20 overflow-hidden border ${i === imgIdx ? "border-foreground" : "border-border"}`}
                  >
                    <img src={im} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </button>
                ))}
                {product.images.length > 4 && (
                  <div className="aspect-square w-20 border border-border flex items-center justify-center text-xs tracking-[0.2em]">
                    +{product.images.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="eyebrow">{titleCase(subcategory)}</div>
            <h1 className="mt-4 font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
            <p className="mt-4 text-xl tabular-nums">{formatMoney(product.price_cents, product.currency)}</p>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>

            {hasSizes && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] tracking-[0.28em] uppercase">Size</span>
                  <button
                    className="text-[11px] tracking-[0.28em] uppercase link-underline text-[color:var(--brand-cognac)]"
                    onClick={() => setShowSizeChart((v) => !v)}
                  >
                    Size guide
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-12 border text-sm ${selectedSize === sz ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
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
                            <th key={h} className="text-left px-3 py-2 text-[11px] tracking-[0.2em] uppercase font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SIZE_CHART.rows.map((r, i) => (
                          <tr key={i} className="border-t border-border">
                            {r.map((c, j) => (
                              <td key={j} className="px-3 py-2 tabular-nums">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={addToCart}
                className="h-13 py-4 bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] text-[11px] tracking-[0.28em] uppercase hover:bg-[color:var(--brand-cognac)] transition-colors"
              >
                Add to bag
              </button>
              <button
                onClick={buyNow}
                className="h-13 py-4 border border-foreground text-[11px] tracking-[0.28em] uppercase hover:bg-foreground hover:text-background transition-colors"
              >
                Buy now
              </button>
            </div>

            <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground space-y-2">
              <p>• Handcrafted in our atelier — allow 3-5 days for dispatch.</p>
              <p>• Complimentary worldwide shipping on orders over $500.</p>
              <p>• Lifetime repair and reconditioning included.</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-32">
            <h2 className="font-display text-3xl md:text-4xl mb-10">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {related.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}