import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../data/store';
import FileBadge from '../../components/FileBadge';

export default function OwnerProducts() {
  const { products, deleteProduct, deleteProducts, settings } = useStore();
  const [sel, setSel] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulk = () => {
    if (!sel.length) return;
    if (
      !confirm(
        `حذف ${sel.length} منتج نهائيًا؟\nلن تعود بعد تحديث الصفحة.`
      )
    )
      return;
    deleteProducts(sel);
    setSel([]);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">المنتجات</h1>
          <p className="text-sm text-muted">
            {products.length} منتج · الحذف نهائي · حتى 500MB
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sel.length > 0 && (
            <button
              type="button"
              onClick={bulk}
              className="rounded-xl bg-rose-600 text-white font-bold px-3 py-2 text-sm"
            >
              حذف ({sel.length})
            </button>
          )}
          <Link
            to="/owner/products/bulk"
            className="inline-flex items-center gap-1 rounded-xl border border-navy/15 text-navy font-bold px-3 py-2 text-sm hover:bg-navy/5"
          >
            <Layers className="w-4 h-4" />
            رفع متعدد
          </Link>
          <Link
            to="/owner/products/new"
            className="inline-flex items-center gap-1 rounded-xl bg-navy text-white font-bold px-4 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy/8 overflow-hidden">
        <div className="divide-y divide-navy/5">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-cream/50">
              <input
                type="checkbox"
                checked={sel.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="rounded"
              />
              <img src={p.cover} alt="" className="w-10 h-12 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileBadge fileName={p.fileName} productType={p.productType} />
                  <p className="font-semibold text-navy text-sm truncate">{p.title}</p>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  {formatMoney(p.priceUsd, 'both', settings.yerPerUsd)}
                </p>
              </div>
              <Link to={`/owner/products/${p.id}`} className="p-2 text-navy hover:bg-navy/5 rounded-lg">
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`حذف «${p.title}»؟`)) deleteProduct(p.id);
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!products.length && (
            <p className="text-center text-sm text-muted py-10">لا منتجات</p>
          )}
        </div>
      </div>
    </div>
  );
}
