import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function publicClient() {
  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listProducts = createServerFn({ method: "GET" })
  .validator((d: { category?: string | null; subcategory?: string | null } = {}) =>
    z.object({ category: z.string().nullish(), subcategory: z.string().nullish() }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("products").select("*").eq("is_active", true);
    if (data.category && data.category !== 'all') q = q.eq("category_slug", data.category);
    if (data.subcategory && data.subcategory !== 'all') q = q.eq("subcategory_slug", data.subcategory);
    const { data: rows, error } = await q.order("created_at", { ascending: false }).limit(20);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listProductsByCategory = createServerFn({ method: "GET" })
  .validator((d: { category: string; subcategory?: string | null }) =>
    z.object({ category: z.string().min(1), subcategory: z.string().nullish() }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("products").select("*").eq("is_active", true).eq("category_slug", data.category);
    if (data.subcategory) q = q.eq("subcategory_slug", data.subcategory);
    const { data: rows, error } = await q.order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: product, error } = await sb.from("products").select("*").eq("slug", data.slug).eq("is_active", true).maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return null;
    const { data: related } = await sb
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_slug", product.category_slug)
      .neq("id", product.id)
      .limit(4);
    return { product, related: related ?? [] };
  });

export const listFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("products").select("*").eq("is_active", true).eq("featured", true).limit(4);
  if (error) throw new Error(error.message);
  return data ?? [];
});

// --- Admin ---

const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(200),
  description: z.string().max(4000).default(""),
  price_cents: z.number().int().min(0),
  category_slug: z.string().min(1),
  subcategory_slug: z.string().min(1),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const listAllProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: rpcError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    
    if (rpcError) {
      throw new Error(`RPC Error: ${rpcError.message} (${rpcError.code})`);
    }
    
    if (!isAdmin) {
      throw new Error(`Forbidden: User ${context.userId} is not admin. RPC returned: ${String(isAdmin)}`);
    }
    
    const { data, error } = await context.supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(`Products Error: ${error.message}`);
    return data ?? [];
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => productInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.id) {
      const { error } = await context.supabase.from("products").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("products").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });