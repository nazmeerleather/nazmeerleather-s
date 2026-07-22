import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  product_id: string;
  product_slug: string;
  product_name: string;
  image_url: string | null;
  size: string | null;
  quantity: number;
  unit_price_cents: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  add: (item: CartItem) => void;
  update: (product_id: string, size: string | null, quantity: number) => void;
  remove: (product_id: string, size: string | null) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "nazmeer_cart_v1";

function sameLine(a: CartItem, product_id: string, size: string | null) {
  return a.product_id === product_id && (a.size ?? null) === (size ?? null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotalCents: items.reduce((s, i) => s + i.quantity * i.unit_price_cents, 0),
      add(next) {
        setItems((cur) => {
          const idx = cur.findIndex((c) => sameLine(c, next.product_id, next.size));
          if (idx >= 0) {
            const copy = [...cur];
            copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + next.quantity };
            return copy;
          }
          return [...cur, next];
        });
      },
      update(product_id, size, quantity) {
        setItems((cur) =>
          cur.map((c) => (sameLine(c, product_id, size) ? { ...c, quantity: Math.max(1, quantity) } : c)),
        );
      },
      remove(product_id, size) {
        setItems((cur) => cur.filter((c) => !sameLine(c, product_id, size)));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}