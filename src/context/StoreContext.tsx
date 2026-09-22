import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  OWNER,
  createId,
  defaultPayMethods,
  defaultSettings,
  initialProducts,
  type Order,
  type PayMethod,
  type Product,
  type Settings,
} from '../data/store';
import { removeBlob } from '../lib/files';

const K = {
  products: 'ds-products-v2',
  deleted: 'ds-deleted-v2',
  owned: 'ds-owned-v2',
  orders: 'ds-orders-v1',
  settings: 'ds-settings-v1',
  pays: 'ds-pays-v1',
  auth: 'ds-auth-v1',
  currency: 'ds-currency-pref',
  creds: 'ds-owner-creds-v1',
};

export type OwnerCreds = { user: string; pass: string };

function loadJSON<T>(key: string, fb: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fb;
  } catch {
    return fb;
  }
}

function loadProducts(): Product[] {
  const deleted = new Set([
    ...loadJSON<string[]>(K.deleted, []),
    ...loadJSON<string[]>('ds-deleted-v1', []),
  ]);
  const stored =
    loadJSON<Product[] | null>(K.products, null) ??
    loadJSON<Product[] | null>('ds-products-v1', null);

  if (!stored) {
    const list = initialProducts.filter((p) => !deleted.has(p.id));
    localStorage.setItem(K.products, JSON.stringify(list));
    localStorage.setItem(K.deleted, JSON.stringify(Array.from(deleted)));
    return list;
  }

  // مصدر الحقيقة = المحفوظ فقط (لا نعيد المنتجات المحذوفة أبدًا)
  localStorage.setItem(K.owned, '1');
  const cleaned = stored.filter((p) => p?.id && !deleted.has(p.id));
  localStorage.setItem(K.products, JSON.stringify(cleaned));
  localStorage.setItem(K.deleted, JSON.stringify(Array.from(deleted)));
  return cleaned;
}

interface Ctx {
  products: Product[];
  orders: Order[];
  settings: Settings;
  payMethods: PayMethod[];
  isOwner: boolean;
  currency: Settings['displayCurrency'];
  setCurrency: (c: Settings['displayCurrency']) => void;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  /** اسم المستخدم الحالي (للعرض في الإعدادات) */
  ownerUsername: string;
  /** تحديث اسم المستخدم وكلمة المرور */
  updateCredentials: (
    username: string,
    password: string,
    currentPassword: string
  ) => { ok: boolean; error?: string };
  addProduct: (p: Omit<Product, 'id'> & { id?: string }) => Product;
  /** إضافة عدة منتجات دفعة واحدة */
  addProducts: (list: Array<Omit<Product, 'id'> & { id?: string }>) => Product[];
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  addOrder: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  confirmOrder: (id: string) => void;
  updateSettings: (p: Partial<Settings>) => void;
  setPayMethods: (m: PayMethod[]) => void;
  getProduct: (id: string) => Product | undefined;
  enabledPays: PayMethod[];
}

const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(loadProducts);
  const [deleted, setDeleted] = useState(() => loadJSON<string[]>(K.deleted, []));
  const [orders, setOrders] = useState(() => loadJSON<Order[]>(K.orders, []));
  const [settings, setSettings] = useState<Settings>(() => ({
    ...defaultSettings,
    ...loadJSON<Partial<Settings>>(K.settings, {}),
  }));
  const [payMethods, setPayMethodsState] = useState<PayMethod[]>(() => {
    const s = loadJSON<PayMethod[] | null>(K.pays, null);
    return s && s.length ? s : defaultPayMethods;
  });
  const [isOwner, setIsOwner] = useState(() => localStorage.getItem(K.auth) === '1');
  const [creds, setCreds] = useState<OwnerCreds>(() => {
    const saved = loadJSON<OwnerCreds | null>(K.creds, null);
    if (saved?.user && saved?.pass) return saved;
    return { user: OWNER.user, pass: OWNER.pass };
  });
  const [currency, setCurrencyState] = useState<Settings['displayCurrency']>(() => {
    const pref = localStorage.getItem(K.currency) as Settings['displayCurrency'] | null;
    if (pref === 'YER' || pref === 'USD' || pref === 'both') return pref;
    return settings.displayCurrency || 'both';
  });

  useEffect(() => {
    localStorage.setItem(K.products, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(K.deleted, JSON.stringify(deleted));
  }, [deleted]);
  useEffect(() => {
    localStorage.setItem(K.orders, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(K.settings, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(K.pays, JSON.stringify(payMethods));
  }, [payMethods]);
  useEffect(() => {
    localStorage.setItem(K.creds, JSON.stringify(creds));
  }, [creds]);

  const setCurrency = useCallback((c: Settings['displayCurrency']) => {
    setCurrencyState(c);
    localStorage.setItem(K.currency, c);
  }, []);

  const login = useCallback(
    (u: string, p: string) => {
      const ok = u.trim() === creds.user && p === creds.pass;
      if (ok) {
        localStorage.setItem(K.auth, '1');
        setIsOwner(true);
      }
      return ok;
    },
    [creds]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(K.auth);
    setIsOwner(false);
  }, []);

  const updateCredentials = useCallback(
    (username: string, password: string, currentPassword: string) => {
      if (currentPassword !== creds.pass) {
        return { ok: false, error: 'كلمة المرور الحالية غير صحيحة' };
      }
      const user = username.trim();
      if (user.length < 3) {
        return { ok: false, error: 'اسم المستخدم 3 أحرف على الأقل' };
      }
      if (password.length < 6) {
        return { ok: false, error: 'كلمة المرور 6 أحرف على الأقل' };
      }
      const next = { user, pass: password };
      setCreds(next);
      localStorage.setItem(K.creds, JSON.stringify(next));
      return { ok: true };
    },
    [creds.pass]
  );

  const addProduct = useCallback((input: Omit<Product, 'id'> & { id?: string }) => {
    localStorage.setItem(K.owned, '1');
    const p: Product = {
      rating: 5,
      reviews: 0,
      ...input,
      id: input.id || createId(input.title),
    };
    setDeleted((d) => {
      const next = d.filter((x) => x !== p.id);
      localStorage.setItem(K.deleted, JSON.stringify(next));
      return next;
    });
    setProducts((prev) => {
      const next = [p, ...prev.filter((x) => x.id !== p.id)];
      localStorage.setItem(K.products, JSON.stringify(next));
      return next;
    });
    return p;
  }, []);

  const addProducts = useCallback(
    (list: Array<Omit<Product, 'id'> & { id?: string }>) => {
      if (!list.length) return [] as Product[];
      localStorage.setItem(K.owned, '1');
      const created: Product[] = list.map((input) => ({
        rating: 5,
        reviews: 0,
        ...input,
        id: input.id || createId(input.title || 'منتج'),
      }));
      const newIds = new Set(created.map((p) => p.id));
      setDeleted((d) => {
        const next = d.filter((x) => !newIds.has(x));
        localStorage.setItem(K.deleted, JSON.stringify(next));
        return next;
      });
      setProducts((prev) => {
        const without = prev.filter((x) => !newIds.has(x.id));
        const next = [...created, ...without];
        localStorage.setItem(K.products, JSON.stringify(next));
        return next;
      });
      return created;
    },
    []
  );

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    localStorage.setItem(K.owned, '1');
    setProducts((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...patch, id } : x));
      localStorage.setItem(K.products, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    localStorage.setItem(K.owned, '1');
    setProducts((prev) => {
      const t = prev.find((x) => x.id === id);
      if (t?.fileId) void removeBlob(t.fileId);
      const next = prev.filter((x) => x.id !== id);
      localStorage.setItem(K.products, JSON.stringify(next));
      return next;
    });
    setDeleted((d) => {
      const next = d.includes(id) ? d : [...d, id];
      localStorage.setItem(K.deleted, JSON.stringify(next));
      return next;
    });
    window.dispatchEvent(new CustomEvent('ds-purge', { detail: { ids: [id] } }));
  }, []);

  const deleteProducts = useCallback((ids: string[]) => {
    if (!ids.length) return;
    localStorage.setItem(K.owned, '1');
    const set = new Set(ids);
    setProducts((prev) => {
      for (const p of prev) {
        if (set.has(p.id) && p.fileId) void removeBlob(p.fileId);
      }
      const next = prev.filter((x) => !set.has(x.id));
      localStorage.setItem(K.products, JSON.stringify(next));
      return next;
    });
    setDeleted((d) => {
      const next = Array.from(new Set([...d, ...ids]));
      localStorage.setItem(K.deleted, JSON.stringify(next));
      return next;
    });
    window.dispatchEvent(new CustomEvent('ds-purge', { detail: { ids } }));
  }, []);

  const addOrder = useCallback((input: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const o: Order = {
      ...input,
      id: `DS-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: 'بانتظار',
    };
    setOrders((prev) => {
      const next = [o, ...prev];
      localStorage.setItem(K.orders, JSON.stringify(next));
      return next;
    });
    return o;
  }, []);

  const confirmOrder = useCallback((id: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === id ? { ...o, status: 'مؤكد' as const } : o
      );
      localStorage.setItem(K.orders, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSettings = useCallback((p: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...p };
      localStorage.setItem(K.settings, JSON.stringify(next));
      return next;
    });
  }, []);

  const setPayMethods = useCallback((m: PayMethod[]) => {
    setPayMethodsState(m);
    localStorage.setItem(K.pays, JSON.stringify(m));
  }, []);

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const enabledPays = useMemo(
    () => payMethods.filter((p) => p.enabled),
    [payMethods]
  );

  const value = useMemo(
    () => ({
      products,
      orders,
      settings,
      payMethods,
      isOwner,
      currency,
      setCurrency,
      login,
      logout,
      ownerUsername: creds.user,
      updateCredentials,
      addProduct,
      addProducts,
      updateProduct,
      deleteProduct,
      deleteProducts,
      addOrder,
      confirmOrder,
      updateSettings,
      setPayMethods,
      getProduct,
      enabledPays,
    }),
    [
      products,
      orders,
      settings,
      payMethods,
      isOwner,
      currency,
      setCurrency,
      login,
      logout,
      creds.user,
      updateCredentials,
      addProduct,
      addProducts,
      updateProduct,
      deleteProduct,
      deleteProducts,
      addOrder,
      confirmOrder,
      updateSettings,
      setPayMethods,
      getProduct,
      enabledPays,
    ]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const v = useContext(C);
  if (!v) throw new Error('useStore');
  return v;
}
