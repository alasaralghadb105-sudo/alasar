import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { Settings } from '../../data/store';

export default function OwnerSettings() {
  const { settings, updateSettings, ownerUsername, updateCredentials } =
    useStore();
  const [form, setForm] = useState<Settings>(settings);
  const [ok, setOk] = useState(false);

  const [username, setUsername] = useState(ownerUsername);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [show, setShow] = useState(false);
  const [credMsg, setCredMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const set =
    (k: keyof Settings) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const saveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...form,
      yerPerUsd: Math.max(1, Number(form.yerPerUsd) || 530),
    });
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  };

  const saveCreds = (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);
    if (!currentPass) {
      setCredMsg({ ok: false, text: 'أدخل كلمة المرور الحالية' });
      return;
    }
    if (newPass !== confirmPass) {
      setCredMsg({ ok: false, text: 'كلمتا المرور الجديدتان غير متطابقتين' });
      return;
    }
    const result = updateCredentials(username, newPass, currentPass);
    if (!result.ok) {
      setCredMsg({ ok: false, text: result.error || 'تعذّر التحديث' });
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setCredMsg({
      ok: true,
      text: 'تم تحديث اسم المستخدم وكلمة المرور — استخدمها في الدخول التالي',
    });
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold text-navy">
        إعدادات المتجر
      </h1>

      <form
        onSubmit={saveStore}
        className="rounded-2xl bg-white border border-navy/8 p-5 space-y-3 shadow-sm"
      >
        <h2 className="font-display font-bold text-navy text-base">
          هوية المتجر
        </h2>
        <label className="block">
          <span className="label">اسم المتجر</span>
          <input
            className="field"
            value={form.storeName}
            onChange={set('storeName')}
            required
          />
        </label>
        <label className="block">
          <span className="label">اسمك</span>
          <input
            className="field"
            value={form.ownerName}
            onChange={set('ownerName')}
            required
          />
        </label>
        <label className="block">
          <span className="label">شعار</span>
          <input
            className="field"
            value={form.tagline}
            onChange={set('tagline')}
          />
        </label>
        <label className="block">
          <span className="label">نبذة</span>
          <textarea
            className="field resize-y"
            rows={3}
            value={form.about}
            onChange={set('about')}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="label">بريد</span>
            <input
              className="field"
              dir="ltr"
              value={form.email}
              onChange={set('email')}
            />
          </label>
          <label className="block">
            <span className="label">جوال</span>
            <input
              className="field"
              dir="ltr"
              value={form.phone}
              onChange={set('phone')}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="label">سعر الصرف (ر.ي لكل 1$)</span>
            <input
              className="field"
              type="number"
              min={1}
              value={form.yerPerUsd}
              onChange={set('yerPerUsd')}
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="label">عرض العملة الافتراضي</span>
            <select
              className="field"
              value={form.displayCurrency}
              onChange={set('displayCurrency')}
            >
              <option value="both">ر.ي + $</option>
              <option value="YER">ريال يمني</option>
              <option value="USD">دولار</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-bold px-5 py-2.5 text-sm"
        >
          <Save className="w-4 h-4" />
          {ok ? 'تم ✓' : 'حفظ الإعدادات'}
        </button>
      </form>

      {/* تغيير بيانات الدخول */}
      <form
        onSubmit={saveCreds}
        className="rounded-2xl bg-white border border-navy/8 p-5 space-y-3 shadow-sm"
      >
        <h2 className="font-display font-bold text-navy text-base flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-gold" />
          اسم المستخدم وكلمة المرور
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          غيّر بيانات دخول لوحة المالك. ستحتاج كلمة المرور الحالية للتأكيد.
        </p>

        <label className="block">
          <span className="label">اسم المستخدم الحالي</span>
          <input
            className="field bg-cream/80"
            value={ownerUsername}
            readOnly
            dir="ltr"
          />
        </label>

        <label className="block">
          <span className="label">اسم المستخدم الجديد</span>
          <input
            className="field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            dir="ltr"
            required
            minLength={3}
            placeholder="3 أحرف على الأقل"
          />
        </label>

        <label className="block">
          <span className="label">كلمة المرور الحالية</span>
          <div className="relative">
            <input
              className="field pl-10"
              type={show ? 'text' : 'password'}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              autoComplete="current-password"
              dir="ltr"
              required
              placeholder="للتأكيد"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-label="إظهار"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </label>

        <div className="grid sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="label">كلمة المرور الجديدة</span>
            <input
              className="field"
              type={show ? 'text' : 'password'}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              autoComplete="new-password"
              dir="ltr"
              required
              minLength={6}
              placeholder="6 أحرف على الأقل"
            />
          </label>
          <label className="block">
            <span className="label">تأكيد كلمة المرور</span>
            <input
              className="field"
              type={show ? 'text' : 'password'}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              autoComplete="new-password"
              dir="ltr"
              required
              minLength={6}
            />
          </label>
        </div>

        {credMsg && (
          <p
            className={`text-sm rounded-xl px-3 py-2 ${
              credMsg.ok
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {credMsg.text}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-gold text-navy font-bold px-5 py-2.5 text-sm"
        >
          <KeyRound className="w-4 h-4" />
          تحديث بيانات الدخول
        </button>
      </form>
    </div>
  );
}
