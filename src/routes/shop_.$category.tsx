import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { listProductsByCategory } from "@/lib/products.functions";
import { NAV } from "@/lib/navigation";
import { titleCase } from "@/lib/format";

const categoryProductsQuery = (category: string) =>
  queryOptions({
    queryKey: ["products", category],
    queryFn: () => listProductsByCategory({ data: { category } }),
  });

export const Route = createFileRoute("/shop_/$category")({
  loader: ({ context, params }) => {
    const section = NAV.find((s) => s.href === `/shop/${params.category}`);
    if (!section && params.category !== "gloves" && params.category !== "big-packs") {
        // Simple fallback since Gloves/Big Packs might not have extensive nested children in some configs
        throw notFound();
    }
    context.queryClient.ensureQueryData(categoryProductsQuery(params.category));
  },
  head: ({ params }) => ({
    meta: [
      { title: `${titleCase(params.category.replace("-", " "))} — Nazmeer Leather Co.` },
      { name: "description", content: `Shop the ${titleCase(params.category.replace("-", " "))} collection at Nazmeer Leather Co.` },
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
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: products } = useSuspenseQuery(categoryProductsQuery(category));
  const section = NAV.find((s) => s.href === `/shop/${category}`);
  const title = section ? section.title : titleCase(category.replace("-", " "));
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 lg:px-10 py-16 md:py-24">
        <div className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-3">/</span>
          <span className="text-foreground">{title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-none">{title}</h1>
          <p className="text-muted-foreground text-sm tracking-wide uppercase">
            {products.length} {products.length === 1 ? "Piece" : "Pieces"}
          </p>
        </div>

        {section && section.children && section.children.length > 0 && (
          <div className="mb-16 flex flex-wrap gap-4">
            <Link
              to="/shop/$category"
              params={{ category }}
              className="text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 border transition-colors bg-foreground text-background border-foreground"
            >
              View All
            </Link>
            {section.children.map((c) => {
              const sub = c.href.split("/").pop()!;
              return (
                <Link
                  key={c.href}
                  to="/shop/$category/$subcategory"
                  params={{ category, subcategory: sub }}
                  className="text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 border border-border hover:border-foreground transition-colors"
                >
                  {c.title}
                </Link>
              );
            })}
          </div>
        )}

        {products.length === 0 ? (
          <div className="mt-20 py-32 text-center border border-border/50 bg-muted/30">
            <p className="font-display text-3xl">This collection is being crafted.</p>
            <p className="mt-4 text-muted-foreground text-sm tracking-wide">New pieces arriving soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-16">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
