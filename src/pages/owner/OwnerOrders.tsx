import { BadgeCheck, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatMoney, type Order } from '../../data/store';
import FileBadge from '../../components/FileBadge';

export default function OwnerOrders() {
  const { orders, confirmOrder, settings } = useStore();
  const pending = orders.filter((o) => o.status !== 'مؤكد');
  const confirmed = orders.filter((o) => o.status === 'مؤكد');

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">الطلبات</h1>
        <p className="text-sm text-muted mt-1">
          عندما يحوّل العميل: اضغط «تأكيد وفتح التحميل» ليتمكّن من تنزيل الملف
          من صفحة مشترياتي.
        </p>
      </div>

      {!orders.length ? (
        <div className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center">
          <p className="font-display font-bold text-navy mb-1">لا طلبات بعد</p>
          <p className="text-sm text-muted">
            تظهر هنا تلقائيًا عند إتمام الشراء من واجهة المتجر.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                بانتظار تأكيدك ({pending.length})
              </h2>
              {pending.map((o) => (
                <OrderCard
                  key={o.id}
                  o={o}
                  yerPerUsd={settings.yerPerUsd}
                  onConfirm={() => confirmOrder(o.id)}
                />
              ))}
            </section>
          )}

          {confirmed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4" />
                مؤكّدة — التحميل مفتوح ({confirmed.length})
              </h2>
              {confirmed.map((o) => (
                <OrderCard key={o.id} o={o} yerPerUsd={settings.yerPerUsd} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function OrderCard({
  o,
  yerPerUsd,
  onConfirm,
}: {
  o: Order;
  yerPerUsd: number;
  onConfirm?: () => void;
}) {
  const isOk = o.status === 'مؤكد';
  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        isOk ? 'border-emerald-100' : 'border-amber-100'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-mono font-bold text-navy text-sm">{o.id}</p>
          <p className="text-xs text-muted mt-0.5">
            {o.name} · {o.email}
            {o.phone ? ` · ${o.phone}` : ''}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            {new Date(o.createdAt).toLocaleString('ar')} ·{' '}
            <span className="font-semibold text-navy">{o.payMethod}</span>
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isOk
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          {isOk ? 'مؤكد · تحميل مفتوح' : 'بانتظار التأكيد'}
        </span>
      </div>

      {o.note && (
        <p className="text-xs bg-cream rounded-lg px-2.5 py-1.5 mb-3 text-muted">
          ملاحظة العميل: {o.note}
        </p>
      )}

      <ul className="space-y-1.5 mb-3">
        {o.items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <img
              src={it.cover}
              alt=""
              className="w-8 h-10 object-cover rounded"
            />
            <FileBadge fileName={it.fileName} />
            <span className="truncate flex-1 font-medium text-navy">
              {it.title}
              {it.quantity > 1 ? ` ×${it.quantity}` : ''}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy/5">
        <span className="font-display font-bold text-navy text-sm">
          {formatMoney(o.totalUsd, 'both', yerPerUsd)}
        </span>
        {!isOk && onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 shadow-sm"
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            تأكيد الطلب وفتح التحميل
          </button>
        )}
        {isOk && (
          <span className="text-[11px] text-emerald-700 font-semibold">
            يمكن للعميل التحميل من «مشترياتي»
          </span>
        )}
      </div>
    </article>
  );
}
