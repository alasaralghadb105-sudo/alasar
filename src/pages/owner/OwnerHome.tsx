import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney } from '../../data/store';

export default function OwnerHome() {
  const { products, orders, settings } = useStore();
  const pending = orders.filter((o) => o.status === 'بانتظار').length;
  const rev = orders
    .filter((o) => o.status === 'مؤكد')
    .reduce((s, o) => s + o.totalUsd, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-gold text-sm font-semibold">مرحبًا {settings.ownerName}</p>
          <h1 className="font-display text-2xl font-bold text-navy">لوحة التحكم</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/owner/products/bulk"
            className="inline-flex items-center gap-2 rounded-xl bg-gold text-navy font-bold px-4 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            رفع متعدد
          </Link>
          <Link
            to="/owner/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-bold px-4 py-2.5 text-sm"
          >
            منتج واحد
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'منتجات', v: products.length },
          { l: 'بانتظار', v: pending },
          {
            l: 'مبيعات',
            v: formatMoney(rev, 'both', settings.yerPerUsd),
          },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl bg-white border border-navy/8 p-4">
            <p className="text-xs text-muted">{c.l}</p>
            <p className="font-display text-lg font-bold text-navy mt-1 break-all">{c.v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-navy text-white p-5 flex flex-wrap gap-3 justify-between items-center">
        <div>
          <p className="font-bold">أدخل أكثر من منتج دفعة واحدة</p>
          <p className="text-sm text-white/70">
            PDF · APK · ZIP حتى 500MB · ر.ي/$ · حذف نهائي
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/owner/products/bulk"
            className="rounded-xl bg-gold text-navy px-4 py-2 text-sm font-bold"
          >
            رفع متعدد
          </Link>
          <Link to="/owner/orders" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">
            تأكيد تحويل
          </Link>
        </div>
      </div>
    </div>
  );
}
