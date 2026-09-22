import { useState } from 'react';
import { Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { defaultPayMethods, type PayMethod } from '../../data/store';

export default function OwnerPayments() {
  const { payMethods, setPayMethods } = useStore();
  const [list, setList] = useState<PayMethod[]>(payMethods);
  const [ok, setOk] = useState(false);

  const update = (i: number, patch: Partial<PayMethod>) => {
    setList((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!list.some((m) => m.enabled)) return;
    setPayMethods(list);
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">طرق الدفع</h1>
        <p className="text-sm text-muted">وسائل تعمل في اليمن — فعّل وعدّل بياناتك</p>
      </div>
      <form onSubmit={save} className="space-y-3">
        {list.map((m, i) => (
          <div
            key={m.id}
            className={`rounded-2xl border p-4 bg-white ${
              m.enabled ? 'border-navy/10' : 'border-navy/5 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <input
                className="font-display font-bold text-navy bg-transparent border-0 outline-none flex-1"
                value={m.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <label className="text-xs font-bold text-navy flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={(e) => update(i, { enabled: e.target.checked })}
                />
                مفعّل
              </label>
            </div>
            <textarea
              className="field text-xs resize-y"
              rows={2}
              value={m.details}
              onChange={(e) => update(i, { details: e.target.value })}
              placeholder="رقم الحساب / التعليمات"
            />
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-navy">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={m.acceptYER}
                  onChange={(e) => update(i, { acceptYER: e.target.checked })}
                />
                ر.ي
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={m.acceptUSD}
                  onChange={(e) => update(i, { acceptUSD: e.target.checked })}
                />
                $
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={m.manual}
                  onChange={(e) => update(i, { manual: e.target.checked })}
                />
                يحتاج تأكيدك
              </label>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-bold px-5 py-2.5 text-sm"
          >
            <Save className="w-4 h-4" />
            {ok ? 'تم ✓' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={() => setList(defaultPayMethods())}
            className="rounded-xl border border-navy/15 text-navy font-bold px-4 py-2.5 text-sm"
          >
            استعادة حزمة اليمن
          </button>
        </div>
      </form>
    </div>
  );
}
