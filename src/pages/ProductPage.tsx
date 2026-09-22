import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, ShoppingCart } from 'lucide-react';
import { formatMoney } from '../data/store';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import FileBadge from '../components/FileBadge';
import ProductCard from '../components/ProductCard';
import { formatBytes } from '../lib/files';

export default function ProductPage() {
  const { id } = useParams();
  const { getProduct, products, currency, settings } = useStore();
  const { add, has } = useCart();
  const p = id ? getProduct(id) : undefined;

  if (!p) {
    return (
      <div className="text-center py-24">
        <p className="font-display font-bold text-navy mb-3">غير موجود</p>
        <Link to="/shop" className="text-gold text-sm font-semibold">
          المتجر
        </Link>
      </div>
    );
  }

  const more = products
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted mb-6">
        <ArrowRight className="w-4 h-4" />
        المتجر
      </Link>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-3xl bg-white border border-navy/8 p-8 flex flex-col items-center gap-4 shadow-sm">
          <img
            src={p.cover}
            alt={p.title}
            className="w-40 h-52 object-cover rounded-xl shadow-lg"
          />
          <FileBadge fileName={p.fileName} productType={p.productType} size="lg" />
          {p.fileName && (
            <p className="text-xs font-mono text-muted" dir="ltr">
              {p.fileName}
              {p.fileSize ? ` · ${formatBytes(p.fileSize)}` : ''}
            </p>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <FileBadge fileName={p.fileName} productType={p.productType} />
            {p.platform && (
              <span className="text-xs rounded-full bg-navy/5 text-navy px-2 py-0.5 font-semibold">
                {p.platform}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-2">
            {p.title}
          </h1>
          <p className="text-gold text-sm font-semibold mb-3">{p.author}</p>
          <p className="text-muted leading-relaxed mb-6">{p.description}</p>
          <div className="rounded-2xl bg-white border border-navy/10 p-5 shadow-sm mb-5">
            <p className="font-display text-2xl font-bold text-navy mb-4">
              {formatMoney(p.priceUsd, currency, settings.yerPerUsd)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => add(p)}
                className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-bold px-5 py-3 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {has(p.id) ? 'في السلة — أضف' : 'أضف للسلة'}
              </button>
              <Link
                to="/cart"
                onClick={() => {
                  if (!has(p.id)) add(p);
                }}
                className="inline-flex items-center rounded-xl bg-gold text-navy font-bold px-5 py-3 text-sm"
              >
                اشترِ الآن
              </Link>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              'تحميل بعد تأكيد الدفع/التحويل',
              'رمز الملف يظهر حسب النوع (PDF/APK/…)',
              'دعم ر.ي و $',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {more.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-navy mb-4">مشابه</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {more.map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
