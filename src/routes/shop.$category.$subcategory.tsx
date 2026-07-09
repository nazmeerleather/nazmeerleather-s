import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { listProductsByCategory } from "@/lib/products.functions";
import { NAV } from "@/lib/navigation";
import { titleCase } from "@/lib/format";

const productsQuery = (category: string, subcategory: string) =>
  queryOptions({
    queryKey: ["products", category, subcategory],
    queryFn: () => listProductsByCategory({ data: { category, subcategory } }),
  });

export const Route = createFileRoute("/shop/$category/$subcategory")({
  loader: ({ context, params }) => {
    const section = NAV.find((s) => s.href === `/shop/${params.category}`);
    if (!section) throw notFound();
    const child = section.children.find((c) => c.href.endsWith(`/${params.subcategory}`));
    if (!child) throw notFound();
    context.queryClient.ensureQueryData(productsQuery(params.category, params.subcategory));
  },
  head: ({ params }) => ({
    meta: [
      { title: `${titleCase(params.subcategory)} — Chiragh Leather Co.` },
      { name: "description", content: `Shop ${titleCase(params.subcategory)} at Chiragh Leather Co.` },
    ],
  }),
  errorComponent: ({ reset }) => (
    <div className="p-20 text-center">
      <p>Unable to load this collection.</p>
      <button onClick={reset} className="underline mt-4">Try again</button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-20 text-center font-display text-2xl">Collection not found</div>
  ),
  component: ListingPage,
});

function ListingPage() {
  const { category, subcategory } = Route.useParams();
  const { data: products } = useSuspenseQuery(productsQuery(category, subcategory));
  const section = NAV.find((s) => s.href === `/shop/${category}`)!;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 md:py-24">
        <div className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span>{section.title}</span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl">{titleCase(subcategory)}</h1>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-20 py-24 text-center border border-border">
            <p className="font-display text-2xl">This collection is being crafted.</p>
            <p className="mt-3 text-muted-foreground text-sm">New pieces arriving soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 gap-y-14">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}

        <div className="mt-24 flex flex-wrap gap-3">
          {section.children.map((c) => {
            const sub = c.href.split("/").pop()!;
            const active = sub === subcategory;
            return (
              <Link
                key={c.href}
                to="/shop/$category/$subcategory"
                params={{ category, subcategory: sub }}
                className={`text-[11px] tracking-[0.28em] uppercase px-4 py-2 border ${active ? "bg-[color:var(--brand-espresso)] text-[color:var(--brand-bone)] border-transparent" : "border-border hover:border-foreground"}`}
              >
                {c.title}
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}