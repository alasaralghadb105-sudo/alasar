import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../data/store';
import { formatMoney } from '../data/store';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import FileBadge from './FileBadge';
import { formatBytes } from '../lib/files';

export default function ProductCard({ product: p }: { product: Product }) {
  const { add, has } = useCart();
  const { currency, settings } = useStore();
  const inCart = has(p.id);
  const disc =
    p.originalUsd && p.originalUsd > p.priceUsd
      ? Math.round(((p.originalUsd - p.priceUsd) / p.originalUsd) * 100)
      : 0;

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-navy/8 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <Link to={`/p/${p.id}`} className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={p.cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[1px] scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
          <img
            src={p.cover}
            alt={p.title}
            className="w-20 h-28 object-cover rounded-lg shadow-xl border border-white -rotate-3 group-hover:rotate-0 transition-transform"
            loading="lazy"
          />
          <FileBadge fileName={p.fileName} productType={p.productType} size="md" />
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <FileBadge fileName={p.fileName} productType={p.productType} />
          {disc > 0 && (
            <span className="rounded-full bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5">
              -{disc}%
            </span>
          )}
        </div>
        {p.fileSize ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-white/95 text-[10px] font-semibold text-navy px-2 py-0.5">
            {formatBytes(p.fileSize)}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <p className="text-[11px] text-gold font-medium truncate">{p.author}</p>
        <Link to={`/p/${p.id}`}>
          <h3 className="font-display font-bold text-navy text-[15px] line-clamp-2 min-h-[2.5rem] leading-snug">
            {p.title}
          </h3>
        </Link>
        <p className="text-xs text-muted line-clamp-2">{p.description}</p>
        <div className="flex items-center gap-1 text-xs mt-1">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span className="font-semibold text-navy">{p.rating}</span>
          <span className="text-muted">({p.reviews})</span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-navy/5">
          <div className="min-w-0">
            <p className="font-display font-bold text-navy text-sm leading-tight">
              {formatMoney(p.priceUsd, currency, settings.yerPerUsd)}
            </p>
            {p.originalUsd ? (
              <p className="text-[11px] text-muted line-through">
                {formatMoney(p.originalUsd, currency, settings.yerPerUsd)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => add(p)}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold shrink-0 ${
              inCart ? 'bg-gold-soft text-navy' : 'bg-navy text-white hover:bg-navy-light'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inCart ? 'في السلة' : 'أضف'}
          </button>
        </div>
      </div>
    </article>
  );
}
