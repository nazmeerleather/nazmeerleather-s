This is a large build (storefront + cart/checkout + admin + custom-order flow). I'll ship it in focused phases so you can review as we go. Everything below uses Lovable Cloud (built-in database, auth, storage, server functions) so no external accounts are needed.

## Phase 1 — Brand foundation & storefront shell
- Design system in `src/styles.css`: dark neutral palette (deep espresso, cognac accent, bone/ivory), luxury type pair (Cormorant Garamond display + Inter body), generous spacing, subtle motion tokens.
- Header with wordmark "CHIRAGH LEATHER CO.", full mega-menu (Men, Women, Gloves, Big Packs, Customize) with the subcategories you listed.
- Footer with brand block, tagline slot, and columns (Shop / Company / Support / Legal).
- Homepage: hero, category tiles for each main section, editorial "world of Chiragh" band, featured collection strip.
- Generated hero + category imagery (leather-goods editorial photography style).

## Phase 2 — Catalog (public)
- Database tables: `categories`, `subcategories`, `products`, `product_images`, `product_sizes`, `size_charts`.
- Listing page per subcategory (grid, filter by price/size, sort).
- Product detail: large image + thumbnail gallery with "+N" indicator, description, price, size selector, size-chart table (XS–XXL: Chest / Waist / Shoulder / Sleeves / Length), Add to Cart, Buy Now, related products.

## Phase 3 — Cart & checkout
- Cart drawer + full cart page (line items, sizes, qty, totals) — persisted client-side and to Cloud when signed in.
- Checkout: name, address, phone, order notes. Order stored in `orders` + `order_items`. Confirmation screen.
- Payment: for now, "Cash on Delivery / Bank Transfer" placeholder — I'll ask before wiring a real processor (Stripe/Paddle) in a later pass.

## Phase 4 — Customize flow
- `/customize` landing with three intake flows (Men's Jackets, Women's Jackets, Women's Coats).
- Multi-step form (measurements, leather type, color, lining, hardware, reference image upload, contact) → saved to `custom_requests` table, visible in admin.

## Phase 5 — Admin panel
- Auth (email/password) with a `user_roles` table + `has_role()` security-definer function; only `admin` role can access `/admin`.
- Product CRUD (with image upload to Cloud storage), category management, size-chart editor.
- Orders list, detail view, status updates (pending / confirmed / shipped / delivered / cancelled).
- Custom-request inbox with status + notes.

## Technical notes
- TanStack Start routes under `src/routes/`, protected admin routes under `src/routes/_authenticated/admin/`.
- Server functions (`createServerFn`) for all writes; RLS on every table (public read for products/categories, owner-scoped for orders, admin-only for management).
- Images generated via image tool and stored under `src/assets/` for marketing imagery; product images uploaded to Cloud storage by admin.
- SEO: per-route `head()` (title, description, og) on every public page.

## What I'll do first if you approve
Phase 1 (brand + storefront shell + homepage with generated imagery). Then I'll pause so you can react to the aesthetic before I wire the catalog and backend.

## Open questions I'll need before Phase 3
1. Currency (PKR, USD, other)?
2. Real payment processor now, or ship with COD/bank-transfer and add Stripe later?
3. Tagline text for the footer (or leave a placeholder)?

Reply "go" to start Phase 1, or tweak anything above first.