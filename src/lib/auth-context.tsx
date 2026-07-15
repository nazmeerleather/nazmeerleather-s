import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkAdmin = async (userId: string) => {
      try {
        console.log("=== ADMIN CHECK START ===");
        console.log("User ID:", userId);

        // Attempt 1: Direct table query
        const { data, error, status, statusText } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        const result = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin');
          
        console.log('Direct query result:', {
          status: result.status,
          errorMsg: result.error?.message,
          errorDetails: result.error?.details,
          data: result.data
        });

        const rpcResult = await supabase
          .rpc('has_role', { _user_id: userId, _role: 'admin' });
          
        console.log('RPC result:', {
          errorMsg: rpcResult.error?.message,
          errorDetails: rpcResult.error?.details,
          data: rpcResult.data
        });

        const isDirectAdmin = result.data && result.data.length > 0;
        const isRpcAdmin = rpcResult.data === true;

        if (isDirectAdmin || isRpcAdmin) {
          console.log('✅ User IS admin!');
          if (mounted) setIsAdmin(true);
        } else {
          console.log('❌ Not admin - both checks failed');
          if (mounted) setIsAdmin(false);
        }
      } catch (e) {
        console.error("Admin check exception:", e);
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setLoading(false);
        console.log("=== ADMIN CHECK END ===");
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        checkAdmin(sess.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        checkAdmin(s.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
