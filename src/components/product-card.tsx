import { Link } from "@tanstack/react-router";
import { formatMoney } from "@/lib/format";

type Product = {
  slug: string;
  name: string;
  price_cents: number;
  currency?: string | null;
  images: string[];
  category_slug: string;
  subcategory_slug: string;
};

export function ProductCard({ p }: { p: Product }) {
  const img = p.images?.[0] ?? "";
  return (
    <Link
      to="/shop/$category/$subcategory/$slug"
      params={{ category: p.category_slug, subcategory: p.subcategory_slug, slug: p.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {img && (
          <img
            src={img}
            alt={p.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg leading-tight">{p.name}</h3>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatMoney(p.price_cents, p.currency ?? "USD")}
        </span>
      </div>
    </Link>
  );
}