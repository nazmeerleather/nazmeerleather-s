import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, Search, ShoppingBag, User, X, ChevronLeft, MessageSquare, Phone, MessagesSquare } from "lucide-react";
import { NAV, type NavSection } from "@/lib/navigation";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NavSection | null>(null);
  const { count } = useCart();

  // Prevent scroll when drawers are open
  useEffect(() => {
    if (menuOpen || contactOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen, contactOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setTimeout(() => setActiveCategory(null), 300); // Wait for transition
  };

  const closeContact = () => {
    setContactOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-[72px]">
            {/* Left: Contact Us */}
            <div className="flex items-center">
              <button
                onClick={() => setContactOpen(true)}
                className="hidden md:inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium tracking-wide"
              >
                <PlusIcon className="w-3 h-3" />
                Contact Us
              </button>
            </div>

            {/* Center: Logo */}
            <Link
              to="/"
              className="font-display text-center tracking-[0.32em] text-[18px] md:text-[22px] text-foreground select-none"
            >
              NAZMEER
            </Link>

            {/* Right: Utilities */}
            <div className="flex items-center gap-5 justify-end">
              <Link
                to="/cart"
                className="inline-flex items-center text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
                {count > 0 && (
                  <span className="ml-1.5 text-xs font-medium tabular-nums">{count}</span>
                )}
              </Link>
              <Link
                to="/auth"
                className="hidden md:inline-flex text-foreground/80 hover:text-foreground transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5 stroke-[1.5]" />
              </Link>
              <button
                aria-label="Search"
                className="hidden md:inline-flex text-foreground/80 hover:text-foreground transition-colors"
              >
                <Search className="h-5 w-5 stroke-[1.5]" />
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium tracking-wide uppercase"
              >
                <Menu className="h-5 w-5 stroke-[1.5]" />
                <span className="hidden md:inline-block">Menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* Menu Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[400px] bg-background shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Close Button */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={closeMenu}
              className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center text-background hover:scale-105 transition-transform"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Primary Menu View */}
          <div
            className={`absolute inset-0 pt-24 px-12 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeCategory ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <nav className="flex flex-col gap-6 mt-8">
              {NAV.map((sec) => (
                <button
                  key={sec.title}
                  onClick={() => setActiveCategory(sec)}
                  className="text-left font-display text-3xl tracking-wide text-foreground hover:text-[color:var(--brand-cognac)] transition-colors"
                >
                  {sec.title}
                </button>
              ))}
            </nav>

            <div className="mt-20 flex flex-col gap-5 text-sm tracking-wide">
              <Link to="/" className="hover:underline underline-offset-4">Sign In</Link>
              <Link to="/" className="hover:underline underline-offset-4">My Orders</Link>
              <button onClick={() => { setContactOpen(true); setMenuOpen(false); }} className="text-left hover:underline underline-offset-4">Contact Us</button>
              <a href="tel:+18774822430" className="hover:underline underline-offset-4">+1 8774822430</a>
            </div>
          </div>

          {/* Secondary (Category) View */}
          <div
            className={`absolute inset-0 pt-24 px-12 bg-background transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
              activeCategory ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium hover:text-[color:var(--brand-cognac)] transition-colors mb-12"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {activeCategory && (
              <>
                <h2 className="font-display text-4xl mb-10 text-foreground">
                  {activeCategory.title}
                </h2>
                <nav className="flex flex-col gap-6">
                  {activeCategory.children.map((child) => (
                    <Link
                      key={child.title}
                      to={child.href as any}
                      onClick={closeMenu}
                      className="text-lg tracking-wide text-foreground hover:text-[color:var(--brand-cognac)] transition-colors"
                    >
                      {child.title}
                    </Link>
                  ))}
                  <Link
                    to={activeCategory.href as any}
                    onClick={closeMenu}
                    className="mt-6 text-lg tracking-wide text-[color:var(--brand-cognac)] hover:underline underline-offset-4"
                  >
                    View All {activeCategory.title}
                  </Link>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Drawer Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          contactOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeContact}
      />

      {/* Contact Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-background shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto ${
          contactOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative pt-24 px-12 pb-20">
          <div className="absolute top-6 right-6">
            <button
              onClick={closeContact}
              className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center text-background hover:scale-105 transition-transform"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="font-display text-4xl mb-12 tracking-wide uppercase">
            Contact Us
          </h2>

          <div className="space-y-12">
            <div>
              <h3 className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-bold mb-3 border-b border-foreground inline-flex pb-1">
                <MessageSquare className="h-4 w-4" /> Message Us
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monday - Saturday from 10 AM to 8.30 PM (EST).<br />
                Sunday from 11.30 AM to 8.30 PM (EST).
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-bold mb-3 border-b border-foreground inline-flex pb-1">
                <Phone className="h-4 w-4" /> Call Us +1 (877) 482-2430
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monday - Saturday from 10 AM to 8.30 PM (EST).<br />
                Sunday from 11.30 AM to 8.30 PM (EST).
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-bold mb-3 border-b border-muted-foreground inline-flex pb-1 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-yellow-400" /> Live Chat
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monday - Saturday from 10 AM to 8.30 PM (EST).<br />
                Sunday from 11.30 AM to 8.30 PM (EST).
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase font-bold mb-3 border-b border-foreground inline-flex pb-1">
                <MessagesSquare className="h-4 w-4" /> WhatsApp Us
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monday - Saturday from 10 AM to 8.30 PM (EST).<br />
                Sunday from 11.30 AM to 8.30 PM (EST).
              </p>
            </div>

            <div className="pt-8">
              <h4 className="text-lg font-medium mb-4">Do you need further assistance?</h4>
              <button className="text-sm font-medium border-b border-foreground pb-1 hover:text-[color:var(--brand-cognac)] hover:border-[color:var(--brand-cognac)] transition-colors">
                Get in Contact with Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}