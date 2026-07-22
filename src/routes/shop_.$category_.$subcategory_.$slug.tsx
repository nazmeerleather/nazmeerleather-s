import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Lock, Check } from "lucide-react";
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

export const Route = createFileRoute("/shop_/$category_/$subcategory_/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
  },
  head: () => ({ meta: [{ title: "Product — Nazmeer Leather Co." }] }),
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

function ProductPage() {
  const { category, subcategory, slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const navigate = useNavigate();
  const { add } = useCart();
  const product = data!.product;
  const related = data!.related;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(hasSizes ? null : "one-size");
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.jpg"];

  const addToCart = () => {
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    add({
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      image_url: images[0],
      size: hasSizes ? selectedSize : null,
      quantity: 1,
      unit_price_cents: product.price_cents,
    });
    toast.success("Added to bag");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-foreground font-sans">
      <div className="fixed top-0 w-full z-40 bg-transparent">
        <SiteHeader />
      </div>

      <main className="pt-[72px]">
        {/* TOP SECTION: Carousel */}
        <section className="relative w-full h-[70vh] md:h-[85vh] bg-[#f9f9f9] flex items-center justify-center overflow-hidden">
          <img
            src={images[activeImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />

          {/* Thumbnails and Navigation (Bottom Right) */}
          {images.length > 1 && (
            <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex items-center gap-2">
              <div className="flex gap-2 mr-4 bg-white/50 backdrop-blur-md p-1 rounded-sm">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 md:w-16 md:h-16 bg-white overflow-hidden border ${activeImageIndex === idx ? "border-black" : "border-transparent"}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20"
              >
                &lt;
              </button>
              <button
                onClick={() => setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20"
              >
                &gt;
              </button>
            </div>
          )}
        </section>

        {/* MIDDLE SECTION: Details & Add to Bag */}
        <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-12 md:gap-24">

          {/* Left Column: Descriptions & Accordions */}
          <div className="md:col-span-7">
            <h1 className="font-display text-2xl md:text-3xl mb-4 text-[#1a1a1a]">{product.name}</h1>
            <p className="text-lg mb-12 font-medium">{formatMoney(product.price_cents, product.currency)}</p>

            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-6 text-[#1a1a1a]">Product Description</h2>
            <p className="text-xs text-muted-foreground mb-6">Style {product.id.split('-')[0].toUpperCase()} NAZMEER</p>

            <p className="text-sm leading-relaxed text-[#333] mb-12 font-light">
              {product.description}
            </p>

            {/* Accordions */}
            <div className="border-t border-[#e5e5e5]">
              {[
                {
                  id: "details",
                  title: "Product Details",
                  body: (
                    <ul className="space-y-2 text-sm text-[#333] font-light pl-4 list-disc">
                      <li>Premium hand-selected leather</li>
                      <li>Hand-stitched detailing</li>
                      <li>Brass hardware with vintage finish</li>
                      <li>Crafted in our bespoke atelier</li>
                    </ul>
                  ),
                },
                {
                  id: "materials",
                  title: "Materials & Care",
                  body: (
                    <p className="text-sm text-[#333] font-light leading-relaxed">
                      Nazmeer products are crafted from carefully selected materials. Please handle with care for a longer product life. Protect from direct light, heat, and rain. Store in the provided flannel bag or box.
                    </p>
                  ),
                },
                {
                  id: "commitment",
                  title: "Our Commitment",
                  body: (
                    <p className="text-sm text-[#333] font-light leading-relaxed">
                      We are committed to sustainable and ethical craftsmanship. Every piece is made to last a lifetime, reducing waste and honoring the artisanal tradition.
                    </p>
                  ),
                },
              ].map((s) => {
                const open = openSection === s.id;
                return (
                  <div key={s.id} className="border-b border-[#e5e5e5]">
                    <button
                      onClick={() => setOpenSection(open ? null : s.id)}
                      className="flex w-full items-center justify-between py-6 text-left"
                    >
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {s.title}
                      </span>
                      {open ? (
                        <Minus className="h-4 w-4 text-[#1a1a1a]" strokeWidth={1} />
                      ) : (
                        <Plus className="h-4 w-4 text-[#1a1a1a]" strokeWidth={1} />
                      )}
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pb-8 pr-4">{s.body}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sticky Add to Bag */}
          <div className="md:col-span-5 relative">
            <div className="md:sticky md:top-32 space-y-8">

              {hasSizes && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium">Size</span>
                    <button className="text-[10px] uppercase tracking-wider underline">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-3 text-xs text-center border transition-all ${selectedSize === sz
                            ? "border-black bg-black text-white"
                            : "border-[#e5e5e5] hover:border-black"
                          }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={addToCart}
                className="w-full py-4 bg-black text-white text-xs tracking-[0.1em] font-medium uppercase flex items-center justify-center gap-3 hover:bg-black/80 transition-colors"
              >
                <Lock className="h-3.5 w-3.5" />
                Add to Bag
              </button>

              <div className="space-y-4 pt-6 border-t border-[#e5e5e5]">
                <div className="flex gap-3 items-start text-xs text-[#333] font-light">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Collect in Store available in 1-2 business days. Estimated time for Standard delivery: 3-7 business days.</p>
                </div>

                <div className="pt-4 space-y-3">
                  <a href="#" className="flex items-center gap-2 text-xs font-medium hover:underline underline-offset-4">
                    Contact Us
                  </a>
                  <p className="text-[10px] text-muted-foreground">Our Client Advisors are available to help you.</p>

                  <a href="#" className="flex items-center gap-2 text-xs font-medium hover:underline underline-offset-4 pt-2">
                    Find in store and Book an appointment
                  </a>

                  <a href="#" className="flex items-center gap-2 text-xs font-medium hover:underline underline-offset-4 pt-2">
                    Nazmeer Services
                  </a>
                  <p className="text-[10px] text-muted-foreground">Complimentary Shipping & Collect in Store, Complimentary Exchanges & Returns, Secure Payments and Signature Packaging</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION: You May Also Like */}
        {related.length > 0 && (
          <section className="bg-white border-t border-[#e5e5e5] py-24">
            <h2 className="text-center text-sm font-bold tracking-[0.15em] uppercase mb-16 text-[#1a1a1a]">You May Also Like</h2>
            <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
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