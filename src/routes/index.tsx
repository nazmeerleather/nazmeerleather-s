import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroJacket from "@/assets/hero-jacket.jpg";
import heroBg from "@/assets/hero-bg.png";
import catMen from "@/assets/category-men.jpg";
import catWomen from "@/assets/category-women.jpg";
import catGloves from "@/assets/category-gloves.jpg";
import catBigPacks from "@/assets/category-bigpacks.jpg";
import catCustomize from "@/assets/customize-craft.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: "faq-1",
      question: "Do you offer international shipping?",
      answer: "Yes, we offer complimentary worldwide shipping on all orders. Estimated delivery times range from 3 to 7 business days depending on your location."
    },
    {
      id: "faq-2",
      question: "How do I care for my leather product?",
      answer: "Chiragh products are crafted from carefully selected materials. Please handle with care for a longer product life. Protect from direct light, heat, and rain. Should it become wet, dry it immediately with a soft cloth. Store in the provided flannel bag or box."
    },
    {
      id: "faq-3",
      question: "What is your return policy?",
      answer: "We offer complimentary exchanges and returns within 30 days of receiving your order, provided the item is in its original condition and packaging."
    },
    {
      id: "faq-4",
      question: "Can I commission a bespoke piece?",
      answer: "Absolutely. Our atelier hand-crafts to your exact specifications. You can book an appointment with one of our Client Advisors to begin the bespoke process."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <SiteHeader />
      <main className="-mt-[72px]">
        {/* HERO - Full Screen Image */}
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-10 bg-black/10" />
          <img
            src={heroBg}
            alt="The Art of Leather"
            className="absolute inset-0 h-full w-full object-cover z-0"
          />
          
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
            <h1 className="font-display text-5xl md:text-7xl lg:text-[6rem] leading-[0.9] text-white tracking-tight drop-shadow-md">
              The Art of Leather
            </h1>
            <p className="mt-8 text-base md:text-lg text-white/90 leading-relaxed max-w-lg font-light tracking-wide drop-shadow-sm">
              Full-grain hides, cut and hand-stitched by master artisans. Built to outlast a generation.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-6">
              <Link
                to="/shop/$category"
                params={{ category: "men" }}
                className="inline-flex items-center justify-center h-14 min-w-[200px] px-8 bg-white/20 backdrop-blur-md border border-white/40 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                Shop Men
              </Link>
              <Link
                to="/shop/$category"
                params={{ category: "women" }}
                className="inline-flex items-center justify-center h-14 min-w-[200px] px-8 bg-white/20 backdrop-blur-md border border-white/40 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-300"
              >
                Shop Women
              </Link>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 gap-3 opacity-70 animate-pulse text-white">
            <span className="text-[9px] tracking-[0.3em] uppercase drop-shadow-sm">Scroll to Discover</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
          </div>
        </section>

        {/* CATEGORIES — Minimalist Luxury Grid */}
        <section className="mx-auto max-w-[1600px] px-6 lg:px-10 py-32">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <CategoryCard src={catWomen} title="Women" category="women" className="aspect-[4/5] md:aspect-[3/4]" />
            <CategoryCard src={catMen} title="Men" category="men" className="aspect-[4/5] md:aspect-[3/4]" />
            <CategoryCard src={catGloves} title="Gloves" category="gloves" className="aspect-[4/5] md:aspect-[16/10]" />
            <CategoryCard src={catBigPacks} title="Big Packs" category="big-packs" className="aspect-[4/5] md:aspect-[16/10]" />
          </div>
        </section>

        {/* CUSTOMIZE */}
        <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={catCustomize}
            alt="Master artisan"
            className="absolute inset-0 h-full w-full object-cover z-0"
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight">
              Bespoke Services
            </h2>
            <p className="mt-6 text-white/80 leading-relaxed font-light tracking-wide max-w-lg">
              Commission a piece entirely yours. Our atelier hand-crafts to your exact measurements — a process refined over three generations.
            </p>
            <Link
              to="/customize"
              className="mt-10 inline-flex items-center justify-center h-14 px-10 border border-white text-white text-[11px] tracking-[0.25em] uppercase hover:bg-white hover:text-black transition-all duration-300"
            >
              Discover Customize
            </Link>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-[#f9f9f9] py-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="text-center mb-20">
              <h2 className="font-display text-3xl md:text-4xl text-[#1a1a1a]">A Legacy of Excellence</h2>
              <p className="mt-4 text-sm text-muted-foreground uppercase tracking-[0.2em]">Words from our clients</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {[
                {
                  quote: "The craftsmanship is unparalleled. My bespoke duffle has traveled with me to over 20 countries and still looks as flawless as the day I received it.",
                  author: "Jonathan E.",
                  location: "London, UK"
                },
                {
                  quote: "A true masterclass in leatherwork. The attention to detail in the stitching and hardware reflects a level of luxury rarely seen today.",
                  author: "Isabella R.",
                  location: "Milan, Italy"
                },
                {
                  quote: "From the initial consultation to the final delivery, the bespoke experience was exceptional. The perfect blend of heritage and modern design.",
                  author: "Alexander M.",
                  location: "New York, USA"
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-8 bg-white border border-[#e5e5e5]">
                  <div className="flex gap-1 mb-6 text-[color:var(--brand-cognac)]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[#333] leading-relaxed font-light mb-8 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]">{testimonial.author}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQS */}
        <section className="py-32">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl text-[#1a1a1a]">Client Services</h2>
              <p className="mt-4 text-sm text-muted-foreground uppercase tracking-[0.2em]">Frequently Asked Questions</p>
            </div>
            
            <div className="border-t border-[#e5e5e5]">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="border-b border-[#e5e5e5]">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between py-6 text-left group"
                    >
                      <span className="text-sm font-medium text-[#1a1a1a] group-hover:text-muted-foreground transition-colors">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <Minus className="h-4 w-4 text-[#1a1a1a]" strokeWidth={1} />
                      ) : (
                        <Plus className="h-4 w-4 text-[#1a1a1a]" strokeWidth={1} />
                      )}
                    </button>
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pb-8 pr-4">
                          <p className="text-sm text-[#333] font-light leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-xs text-muted-foreground mb-4">Still have questions?</p>
              <a href="#" className="inline-block text-xs font-bold uppercase tracking-[0.15em] border-b border-black pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-colors">
                Contact our Client Advisors
              </a>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryCard({
  src,
  title,
  category,
  className,
}: {
  src: string;
  title: string;
  category: string;
  className?: string;
}) {
  return (
    <Link to="/shop/$category" params={{ category }} className={`group relative block overflow-hidden bg-muted ${className ?? ""}`}>
      <img
        src={src}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <h3 className="font-display text-4xl md:text-5xl text-white tracking-wide mix-blend-overlay opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-md">
          {title}
        </h3>
      </div>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
         <span className="inline-flex items-center justify-center h-12 px-8 border border-white/50 text-white text-[10px] tracking-[0.3em] uppercase backdrop-blur-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
           Explore Collection
         </span>
      </div>
    </Link>
  );
}
