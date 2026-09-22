import { Link } from 'react-router-dom';
import { ArrowLeft, Package, ShieldCheck, Smartphone, Wallet } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FileBadge from '../components/FileBadge';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/store';
import { useMemo } from 'react';

export default function HomePage() {
  const { products, settings } = useStore();
  const featured = useMemo(
    () => products.filter((p) => p.featured).slice(0, 4),
    [products]
  );
  const show = featured.length ? featured : products.slice(0, 4);
  const cats = categories.filter((c) => c.id !== 'all');

  return (
    <div>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/images/hero-digital.jpg"
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hero-books.jpg';
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-navy via-navy/90 to-navy/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-gold text-xs font-bold mb-3">متجر إلكتروني رقمي</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold max-w-xl leading-tight mb-4">
            {settings.storeName}
            <span className="block text-gold mt-1 text-2xl sm:text-3xl">
              كتب · تطبيقات · ملفات
            </span>
          </h1>
          <p className="text-white/75 max-w-lg mb-6 leading-relaxed text-sm sm:text-base">
            {settings.about}
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {['a.pdf', 'app.apk', 'pack.zip', 'setup.exe'].map((f) => (
              <FileBadge key={f} fileName={f} />
            ))}
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-gold text-navy font-bold px-6 py-3 text-sm"
          >
            تسوّق الآن
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {cats.map((c) => (
            <Link
              key={c.id}
              to={`/shop?cat=${c.id}`}
              className="rounded-2xl bg-white border border-navy/8 p-3 text-center shadow-sm hover:border-gold transition-colors"
            >
              <span className="text-xl block mb-1">{c.icon}</span>
              <span className="text-xs font-bold text-navy">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-navy">مميز</h2>
          <Link to="/shop" className="text-sm font-semibold text-gold">
            الكل
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {show.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-navy/5">
        <div className="mx-auto max-w-6xl px-4 py-12 grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Package,
              t: 'كل الرقمي',
              d: 'PDF وAPK وبرامج وملفات حتى 500MB',
            },
            {
              icon: Wallet,
              t: 'دفع يمني',
              d: 'كريمي، جوالي، صرافة… ر.ي أو $',
            },
            {
              icon: ShieldCheck,
              t: 'تحميل بعد التأكيد',
              d: 'المالك يؤكد التحويل ثم يُفتح التحميل',
            },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-navy/8 bg-cream p-5">
              <x.icon className="w-8 h-8 text-navy mb-3" />
              <h3 className="font-display font-bold text-navy mb-1">{x.t}</h3>
              <p className="text-sm text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 text-center">
        <div className="rounded-3xl bg-navy text-white px-6 py-10">
          <Smartphone className="w-8 h-8 text-gold mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold mb-2">أنت صاحب المتجر</h2>
          <p className="text-white/70 text-sm mb-5">
            ارفع منتجاتك، فعّل الدفع اليمني، وأكّد التحويلات
          </p>
          <Link
            to="/owner/login"
            className="inline-flex rounded-2xl bg-gold text-navy font-bold px-6 py-3 text-sm"
          >
            دخول المالك
          </Link>
        </div>
      </section>
    </div>
  );
}
