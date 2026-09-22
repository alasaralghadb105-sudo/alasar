import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../data/store';
import FileBadge from '../components/FileBadge';

export default function CartPage() {
  const { items, setQty, remove, subtotalUsd, count } = useCart();
  const { currency, settings } = useStore();
  const money = (u: number) => formatMoney(u, currency, settings.yerPerUsd);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="w-10 h-10 text-navy mx-auto mb-3 opacity-40" />
        <h1 className="font-display text-xl font-bold text-navy mb-2">السلة فارغة</h1>
        <Link to="/shop" className="text-sm font-bold text-gold">
          المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy mb-1">السلة</h1>
      <p className="text-sm text-muted mb-6">{count} عنصر</p>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product: p, quantity }) => (
            <div
              key={p.id}
              className="flex gap-3 rounded-2xl bg-white border border-navy/8 p-3"
            >
              <img src={p.cover} alt="" className="w-14 h-16 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <FileBadge fileName={p.fileName} productType={p.productType} />
                    <Link
                      to={`/p/${p.id}`}
                      className="block font-display font-bold text-navy text-sm mt-1 truncate"
                    >
                      {p.title}
                    </Link>
                  </div>
                  <button type="button" onClick={() => remove(p.id)} className="text-muted p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center rounded-lg border border-navy/12 bg-cream">
                    <button type="button" className="p-1.5" onClick={() => setQty(p.id, quantity - 1)}>
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">{quantity}</span>
                    <button type="button" className="p-1.5" onClick={() => setQty(p.id, quantity + 1)}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-navy text-sm">
                    {money(p.priceUsd * quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl bg-white border border-navy/8 p-5 h-fit shadow-sm">
          <div className="flex justify-between font-bold text-navy mb-4">
            <span>الإجمالي</span>
            <span className="font-display text-lg">{money(subtotalUsd)}</span>
          </div>
          <Link
            to="/checkout"
            className="flex justify-center rounded-xl bg-navy text-white font-bold py-3 text-sm"
          >
            إتمام الشراء
          </Link>
        </aside>
      </div>
    </div>
  );
}
