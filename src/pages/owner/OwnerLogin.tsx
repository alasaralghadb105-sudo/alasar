import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function OwnerLogin() {
  const { isOwner, login, settings } = useStore();
  const nav = useNavigate();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  if (isOwner) return <Navigate to="/owner" replace />;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Store className="w-10 h-10 text-navy mx-auto mb-2" />
          <h1 className="font-display text-xl font-bold text-navy">
            دخول المالك
          </h1>
          <p className="text-xs text-muted mt-1">{settings.storeName}</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (login(u, p)) nav('/owner');
            else setErr('اسم المستخدم أو كلمة المرور غير صحيحة');
          }}
          className="rounded-2xl bg-white border border-navy/10 p-6 space-y-3 shadow-lg"
        >
          <label className="block">
            <span className="label">اسم المستخدم</span>
            <input
              className="field"
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="اسم المستخدم"
              autoComplete="username"
              dir="ltr"
              required
            />
          </label>
          <label className="block">
            <span className="label">كلمة المرور</span>
            <div className="relative">
              <input
                className="field pl-10"
                type={show ? 'text' : 'password'}
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="كلمة المرور"
                autoComplete="current-password"
                dir="ltr"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-label="إظهار كلمة المرور"
              >
                {show ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-navy text-white font-bold py-2.5 text-sm"
          >
            دخول
          </button>
          <p className="text-[11px] text-center text-muted leading-relaxed">
            الافتراضي:{' '}
            <span className="font-mono text-navy" dir="ltr">
              admin / kitabi2024
            </span>
            <br />
            يمكنك تغييرها من الإعدادات بعد الدخول.
          </p>
        </form>
        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-muted">
            ← المتجر
          </Link>
        </p>
      </div>
    </div>
  );
}
