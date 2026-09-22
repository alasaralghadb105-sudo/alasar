import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories, type Category } from '../data/store';
import ProductCard from '../components/ProductCard';
import CurrencySwitch from '../components/CurrencySwitch';
import { useStore } from '../context/StoreContext';

export default function ShopPage() {
  const { products } = useStore();
  const [params, setParams] = useSearchParams();
  const cat = (params.get('cat') as Category) || 'all';
  const [q, setQ] = useState(params.get('q') || '');

  const setCat = (c: Category) => {
    const n = new URLSearchParams(params);
    if (c === 'all') n.delete('cat');
    else n.set('cat', c);
    setParams(n);
  };

  const list = useMemo(() => {
    let r = [...products];
    if (cat !== 'all') r = r.filter((p) => p.category === cat);
    const n = q.trim().toLowerCase();
    if (n) {
      r = r.filter(
        (p) =>
          p.title.toLowerCase().includes(n) ||
          p.author.toLowerCase().includes(n) ||
          (p.fileName || '').toLowerCase().includes(n)
      );
    }
    return r;
  }, [products, cat, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-gold text-sm font-semibold">المتجر الرقمي</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
            تسوّق المنتجات
          </h1>
        </div>
        <CurrencySwitch />
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-white border border-navy/10 px-4 py-3 mb-4 shadow-sm">
        <Search className="w-4 h-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث: كتاب، APK، ملف..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${
              cat === c.id
                ? 'bg-navy text-white'
                : 'bg-white border border-navy/10 text-navy'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted mb-4">{list.length} منتج</p>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/15 p-12 text-center text-muted text-sm bg-white">
          لا نتائج
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
