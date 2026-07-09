import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { NAV } from "@/lib/navigation";

export function SiteHeader() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      {/* Announcement bar */}
      <div className="bg-[color:var(--brand-espresso-deep)] text-[color:var(--brand-bone)]/85 text-[11px] tracking-[0.25em] uppercase text-center py-2">
        Complimentary worldwide shipping on orders over $500
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20">
          {/* Left: mobile toggle + search */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Open menu"
              className="lg:hidden text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              aria-label="Search"
              className="hidden lg:inline-flex text-foreground/70 hover:text-foreground transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Wordmark */}
          <Link
            to="/"
            className="font-display text-center tracking-[0.32em] text-[15px] md:text-[17px] text-foreground select-none"
          >
            CHIRAGH<span className="mx-2 text-[color:var(--brand-cognac)]">·</span>LEATHER CO.
          </Link>

          {/* Right: account + cart */}
          <div className="flex items-center gap-5 justify-end">
            <Link
              to="/"
              className="hidden md:inline-flex text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Account"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="text-[11px] tracking-[0.2em] uppercase hidden md:inline">Bag (0)</span>
            </Link>
          </div>
        </div>

        {/* Desktop nav */}
        <nav
          className="hidden lg:block border-t border-border/50"
          onMouseLeave={() => setOpenIdx(null)}
        >
          <ul className="flex items-center justify-center gap-10 h-12">
            {NAV.map((sec, i) => (
              <li
                key={sec.title}
                onMouseEnter={() => setOpenIdx(i)}
                className="relative"
              >
                <Link
                  to="/"
                  className="text-[11px] tracking-[0.28em] uppercase text-foreground/80 hover:text-[color:var(--brand-cognac)] transition-colors"
                >
                  {sec.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mega dropdown */}
          {openIdx !== null && NAV[openIdx].children.length > 0 && (
            <div className="absolute left-0 right-0 top-full bg-background border-t border-border shadow-[var(--shadow-soft)]">
              <div className="mx-auto max-w-[1400px] px-10 py-10 grid grid-cols-4 gap-10">
                <div>
                  <div className="eyebrow">{NAV[openIdx].title}</div>
                  <h3 className="mt-3 text-3xl font-display text-foreground leading-tight">
                    Shop the<br />collection
                  </h3>
                  <Link
                    to="/"
                    className="mt-6 inline-block text-[11px] tracking-[0.28em] uppercase text-[color:var(--brand-cognac)] link-underline"
                    onClick={() => setOpenIdx(null)}
                  >
                    View all →
                  </Link>
                </div>
                <ul className="col-span-3 grid grid-cols-3 gap-x-8 gap-y-3">
                  {NAV[openIdx].children.map((c) => (
                    <li key={c.href}>
                      <Link
                        to="/"
                        onClick={() => setOpenIdx(null)}
                        className="text-sm text-foreground/85 hover:text-[color:var(--brand-cognac)] transition-colors"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex items-center justify-between h-20 px-6 border-b border-border">
            <span className="font-display tracking-[0.28em] text-sm">CHIRAGH</span>
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-8 overflow-y-auto max-h-[calc(100vh-5rem)]">
            {NAV.map((sec) => (
              <div key={sec.title} className="py-4 border-b border-border/60">
                <div className="text-[11px] tracking-[0.28em] uppercase text-[color:var(--brand-cognac)] mb-3">
                  {sec.title}
                </div>
                <ul className="space-y-3">
                  {sec.children.map((c) => (
                    <li key={c.href}>
                      <Link
                        to="/"
                        onClick={() => setMobileOpen(false)}
                        className="font-display text-xl text-foreground"
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}