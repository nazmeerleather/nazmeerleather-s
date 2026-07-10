import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  product_slug: z.string().min(1),
  image_url: z.string().nullish(),
  size: z.string().nullish(),
  quantity: z.number().int().min(1).max(20),
  unit_price_cents: z.number().int().min(0),
});

const orderSchema = z.object({
  customer_name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(5).max(40),
  address_line1: z.string().min(3).max(200),
  address_line2: z.string().max(200).nullish(),
  city: z.string().min(1).max(120),
  postal_code: z.string().max(40).nullish(),
  country: z.string().min(2).max(80),
  notes: z.string().max(1000).nullish(),
  payment_method: z.enum(["cod", "bank_transfer"]).default("cod"),
  items: z.array(itemSchema).min(1).max(50),
});

export const createOrder = createServerFn({ method: "POST" })
  .validator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const subtotal = data.items.reduce((s, i) => s + i.unit_price_cents * i.quantity, 0);
    const shipping = subtotal >= 50000 ? 0 : 2500;
    const total = subtotal + shipping;

    const { data: order, error } = await sb
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        email: data.email,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2 ?? null,
        city: data.city,
        postal_code: data.postal_code ?? null,
        country: data.country,
        notes: data.notes ?? null,
        payment_method: data.payment_method,
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: total,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const items = data.items.map((i) => ({ ...i, order_id: order.id }));
    const { error: itemsErr } = await sb.from("order_items").insert(items);
    if (itemsErr) throw new Error(itemsErr.message);

    return { orderId: order.id };
  });

export const getOrderById = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    // Public confirmation lookup uses admin key to read (order id is a UUID and acts as unlisted).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    const { data: items } = await supabaseAdmin.from("order_items").select("*").eq("order_id", data.id);
    return { order, items: items ?? [] };
  });

export const listOrdersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getOrderItemsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { data: items, error } = await context.supabase.from("order_items").select("*").eq("order_id", data.orderId);
    if (error) throw new Error(error.message);
    return items ?? [];
  });