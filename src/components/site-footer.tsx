import { Link } from "@tanstack/react-router";
import { NAV } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-[color:var(--brand-espresso-deep)] text-[color:var(--brand-bone)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display tracking-[0.32em] text-lg">
              CHIRAGH<span className="mx-2 text-[color:var(--brand-cognac-soft)]">·</span>LEATHER CO.
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[color:var(--brand-bone)]/70 font-display italic text-lg">
              Handcrafted leather goods, made to be inherited.
            </p>
            <p className="mt-8 text-[11px] tracking-[0.28em] uppercase text-[color:var(--brand-bone)]/50">
              Newsletter
            </p>
            <form className="mt-3 flex border-b border-[color:var(--brand-bone)]/25 pb-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent text-sm placeholder:text-[color:var(--brand-bone)]/40 focus:outline-none"
              />
              <button
                type="submit"
                className="text-[11px] tracking-[0.28em] uppercase text-[color:var(--brand-cognac-soft)] hover:text-[color:var(--brand-bone)] transition-colors"
              >
                Subscribe →
              </button>
            </form>
          </div>

          <FooterCol title="Shop">
            {NAV.slice(0, 4).map((s) => (
              <FooterLink key={s.title}>{s.title}</FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="Company">
            <FooterLink>About</FooterLink>
            <FooterLink>Our Craft</FooterLink>
            <FooterLink>Journal</FooterLink>
            <FooterLink>Stores</FooterLink>
          </FooterCol>
          <FooterCol title="Support">
            <FooterLink>Contact Us</FooterLink>
            <FooterLink>Shipping & Returns</FooterLink>
            <FooterLink>Size Guide</FooterLink>
            <FooterLink>Leather Care</FooterLink>
            <FooterLink>Terms & Conditions</FooterLink>
            <FooterLink>Privacy Policy</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-16 pt-8 border-t border-[color:var(--brand-bone)]/15 flex flex-col md:flex-row justify-between gap-4 text-[11px] tracking-[0.2em] uppercase text-[color:var(--brand-bone)]/50">
          <span>© {new Date().getFullYear()} Chiragh Leather Co. All rights reserved.</span>
          <span>Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.28em] uppercase text-[color:var(--brand-bone)]/50 mb-5">
        {title}
      </div>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <Link
        to="/"
        className="text-sm text-[color:var(--brand-bone)]/85 hover:text-[color:var(--brand-cognac-soft)] transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}