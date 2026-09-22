import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../data/store';

const LAST = 'ds-last-order';

export default function CheckoutPage() {
  const { items, subtotalUsd, clear, count } = useCart();
  const { enabledPays, addOrder, currency, settings } = useStore();
  const navigate = useNavigate();
  const [payId, setPayId] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const money = (u: number) => formatMoney(u, currency, settings.yerPerUsd);
  const pay = enabledPays.find((p) => p.id === payId);

  useEffect(() => {
    if (enabledPays.length && !payId) setPayId(enabledPays[0].id);
  }, [enabledPays, payId]);

  if (!items.length && !done) {
    return (
      <div className="text-center py-20">
        <Link to="/shop" className="text-gold font-semibold text-sm">
          المتجر
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !pay) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const order = addOrder({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      payMethod: pay.label,
      note: form.note.trim() || undefined,
      items: items.map(({ product: p, quantity }) => ({
        productId: p.id,
        title: p.title,
        cover: p.cover,
        priceUsd: p.priceUsd,
        quantity,
        fileId: p.fileId,
        fileName: p.fileName,
      })),
      totalUsd: subtotalUsd,
    });
    localStorage.setItem(LAST, JSON.stringify({ id: order.id, email: order.email }));
    setDone(order.id);
    clear();
    setLoading(false);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-navy mb-2">تم تسجيل الطلب</h1>
        <p className="text-sm text-muted mb-1">
          رقم:{' '}
          <span className="font-mono font-bold text-navy">{done}</span>
        </p>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          احوّل المبلغ بالطريقة التي اخترتها. بعد أن يؤكّد{' '}
          <strong className="text-navy">صاحب المتجر</strong> استلام المبلغ،
          يُفتح التحميل من صفحة مشترياتي.
        </p>
        <div className="rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-xs p-3 mb-5 text-right leading-relaxed">
          احفظ رقم الطلب:{' '}
          <span className="font-mono font-bold" dir="ltr">
            {done}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            to={`/orders?id=${encodeURIComponent(done)}&email=${encodeURIComponent(form.email)}`}
            className="rounded-xl bg-navy text-white font-bold py-3 text-sm"
          >
            الذهاب لمشترياتي / التحميل
          </Link>
          <button type="button" onClick={() => navigate('/shop')} className="text-sm text-muted">
            المتجر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy mb-1">الدفع</h1>
      <p className="text-sm text-muted mb-6">{count} منتج · {money(subtotalUsd)}</p>
      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl bg-white border border-navy/8 p-5 space-y-3">
            <h2 className="font-display font-bold text-navy">بياناتك</h2>
            <input
              required
              className="field"
              placeholder="الاسم"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              required
              type="email"
              className="field"
              placeholder="البريد"
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className="field"
              placeholder="جوال (اختياري)"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="rounded-2xl bg-white border border-navy/8 p-5">
            <h2 className="font-display font-bold text-navy mb-3">طريقة الدفع (اليمن)</h2>
            <div className="grid sm:grid-cols-2 gap-2 mb-3">
              {enabledPays.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPayId(p.id)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold text-right ${
                    payId === p.id
                      ? 'border-navy bg-navy text-white'
                      : 'border-navy/12 text-muted'
                  }`}
                >
                  {p.label}
                  <span className="block text-[10px] font-medium opacity-80 mt-0.5">
                    {p.acceptYER ? 'ر.ي' : ''}
                    {p.acceptYER && p.acceptUSD ? ' · ' : ''}
                    {p.acceptUSD ? '$' : ''}
                  </span>
                </button>
              ))}
            </div>
            {pay && (
              <p className="text-xs text-muted bg-cream rounded-xl p-3 leading-relaxed">
                {pay.details}
                {pay.manual ? ' — التحميل بعد تأكيد المالك.' : ''}
              </p>
            )}
            <textarea
              className="field mt-3 resize-y"
              rows={2}
              placeholder="مرجع التحويل / ملاحظة"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
        </div>
        <aside className="lg:col-span-2">
          <div className="rounded-2xl bg-white border border-navy/8 p-5 sticky top-24">
            <p className="font-display font-bold text-navy text-lg mb-4">
              {money(subtotalUsd)}
            </p>
            <button
              type="submit"
              disabled={loading || !enabledPays.length}
              className="w-full rounded-xl bg-gold text-navy font-bold py-3 text-sm disabled:opacity-50"
            >
              {loading ? '...' : 'تأكيد الطلب'}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
