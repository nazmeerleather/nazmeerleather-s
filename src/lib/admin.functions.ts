import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * First-user admin bootstrap.
 * Grants the calling authenticated user the `admin` role, but ONLY if no admin exists yet.
 * After the first admin exists, only that admin can grant more roles.
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) throw new Error("Admin already exists");
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Try to read user_roles directly using user's token
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
      
    if (!error && data) {
      return { isAdmin: true, userId: context.userId };
    }
    
    // Fallback to has_role RPC just in case
    const { data: rpcData, error: rpcError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    
    if (rpcError) {
      console.error("Error fetching admin status:", rpcError);
      return { isAdmin: false, userId: context.userId };
    }
    
    return { isAdmin: !!rpcData, userId: context.userId };
  });