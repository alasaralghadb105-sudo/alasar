import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../data/store';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  count: number;
  subtotalUsd: number;
  has: (id: string) => boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'ds-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]') as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const onPurge = (e: Event) => {
      const ids = new Set((e as CustomEvent<{ ids: string[] }>).detail?.ids || []);
      if (!ids.size) return;
      setItems((prev) => prev.filter((i) => !ids.has(i.product.id)));
    };
    window.addEventListener('ds-purge', onPurge);
    return () => window.removeEventListener('ds-purge', onPurge);
  }, []);

  const value = useMemo<CartCtx>(() => {
    const add = (p: Product) => {
      setItems((prev) => {
        const f = prev.find((i) => i.product.id === p.id);
        if (f) {
          return prev.map((i) =>
            i.product.id === p.id
              ? { ...i, quantity: Math.min(i.quantity + 1, 5) }
              : i
          );
        }
        return [...prev, { product: p, quantity: 1 }];
      });
    };
    const remove = (id: string) =>
      setItems((prev) => prev.filter((i) => i.product.id !== id));
    const setQty = (id: string, q: number) => {
      if (q < 1) return remove(id);
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === id ? { ...i, quantity: Math.min(q, 5) } : i
        )
      );
    };
    const clear = () => setItems([]);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotalUsd = items.reduce(
      (s, i) => s + i.product.priceUsd * i.quantity,
      0
    );
    const has = (id: string) => items.some((i) => i.product.id === id);
    return { items, add, remove, setQty, clear, count, subtotalUsd, has };
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart');
  return v;
}
