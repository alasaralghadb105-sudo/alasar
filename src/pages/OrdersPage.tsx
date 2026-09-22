import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../data/store';
import FileBadge from '../components/FileBadge';
import { downloadBlob } from '../lib/files';

export default function OrdersPage() {
  const { orders, currency, settings } = useStore();
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get('id') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [looked, setLooked] = useState(!!(params.get('id') && params.get('email')));
  const [msg, setMsg] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      const last = JSON.parse(localStorage.getItem('ds-last-order') || 'null') as {
        id: string;
        email: string;
      } | null;
      if (last) {
        if (!id) setId(last.id);
        if (!email) setEmail(last.email);
        if (last.id && last.email) setLooked(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // إعادة قراءة الطلب عند تغيّر القائمة (بعد تأكيد المالك)
  const order = useMemo(() => {
    void tick;
    if (!looked) return undefined;
    return orders.find(
      (o) =>
        o.id.toLowerCase() === id.trim().toLowerCase() &&
        o.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
  }, [orders, id, email, looked, tick]);

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    setLooked(true);
    setMsg('');
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === id.trim().toLowerCase() &&
        o.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    if (!found) setMsg('لم يُعثر على الطلب — تأكد من الرقم والبريد');
  };

  const dl = async (fileId?: string, name?: string) => {
    if (!order || order.status !== 'مؤكد') {
      setMsg('الطلب لم يُؤكَّد بعد من صاحب المتجر');
      return;
    }
    if (!fileId) {
      setMsg('لا يوجد ملف مرفوع لهذا المنتج على هذا الجهاز');
      return;
    }
    const ok = await downloadBlob(fileId);
    if (!ok) {
      setMsg(
        `تعذّر تحميل ${name || 'الملف'} — يجب أن يكون الملف مرفوعًا من نفس المتصفح`
      );
    } else {
      setMsg('');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">
          مشترياتي / التحميل
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          بعد أن يحوّل العميل ويؤكّد{' '}
          <strong className="text-navy">صاحب المتجر</strong> الطلب، يُفتح زر
          التحميل هنا.
        </p>
      </div>

      <div className="rounded-2xl bg-navy/5 border border-navy/10 p-3 mb-5 flex gap-2 text-xs text-navy leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-gold" />
        <span>
          الحماية: التحميل مقفل حتى يضغط المالك «تأكيد الطلب وفتح التحميل» من
          لوحة الطلبات.
        </span>
      </div>

      <form
        onSubmit={find}
        className="rounded-2xl bg-white border border-navy/8 p-5 space-y-3 mb-6 shadow-sm"
      >
        <label className="block">
          <span className="label">رقم الطلب</span>
          <input
            className="field font-mono"
            placeholder="DS-........"
            dir="ltr"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="label">البريد المستخدم عند الشراء</span>
          <input
            className="field"
            type="email"
            placeholder="email@example.com"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-navy text-white font-bold py-2.5 text-sm"
          >
            <Search className="w-4 h-4" />
            عرض الطلب
          </button>
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="rounded-xl border border-navy/15 px-3 text-navy"
            title="تحديث الحالة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {msg && (
          <p
            className={`text-sm rounded-lg px-3 py-2 ${
              msg.includes('تعذّر') || msg.includes('لم')
                ? 'bg-rose-50 text-rose-700'
                : 'bg-amber-50 text-amber-900'
            }`}
          >
            {msg}
          </p>
        )}
      </form>

      {looked && !order && !msg && (
        <p className="text-center text-sm text-muted">لا نتائج</p>
      )}

      {order && (
        <div className="rounded-2xl bg-white border border-navy/8 overflow-hidden shadow-sm">
          <div
            className={`px-4 py-3 text-sm font-bold ${
              order.status === 'مؤكد'
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-amber-50 text-amber-900'
            }`}
          >
            {order.status === 'مؤكد'
              ? '✓ تم التأكيد — يمكنك التحميل'
              : '⏳ بانتظار تأكيد صاحب المتجر'}
            <span className="block text-xs font-medium mt-1 opacity-80 font-normal">
              {order.id} ·{' '}
              {formatMoney(order.totalUsd, currency, settings.yerPerUsd)} ·{' '}
              {order.payMethod}
            </span>
          </div>

          {order.status !== 'مؤكد' && (
            <p className="px-4 py-3 text-xs text-muted bg-cream border-b border-navy/5 leading-relaxed">
              بعد إتمام التحويل انتظر تأكيد المالك. حدّث الصفحة أو اضغط زر
              التحديث أعلاه.
            </p>
          )}

          <ul className="divide-y divide-navy/5">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 p-4">
                <img
                  src={it.cover}
                  alt=""
                  className="w-11 h-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <FileBadge fileName={it.fileName} />
                  <p className="text-sm font-semibold text-navy truncate mt-1">
                    {it.title}
                  </p>
                  {it.fileName && (
                    <p className="text-[10px] font-mono text-muted truncate" dir="ltr">
                      {it.fileName}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={order.status !== 'مؤكد'}
                  onClick={() => dl(it.fileId, it.fileName || it.title)}
                  className="inline-flex items-center gap-1 rounded-xl bg-gold text-navy text-xs font-bold px-3 py-2.5 disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  {order.status === 'مؤكد' ? 'تحميل' : 'مقفل'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-center text-sm text-muted mt-8">
        <Link to="/shop" className="font-semibold text-navy underline">
          العودة للمتجر
        </Link>
      </p>
    </div>
  );
}
