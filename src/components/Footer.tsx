import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings, isOwner } = useStore();
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20 text-gold">
              <Store className="h-4 w-4" />
            </span>
            <span className="font-display font-bold">{settings.storeName}</span>
          </div>
          <p className="text-white/65 leading-relaxed">{settings.about}</p>
          <p className="text-xs text-white/40 mt-2">المالك: {settings.ownerName}</p>
        </div>
        <div>
          <p className="text-gold font-semibold mb-3">روابط</p>
          <ul className="space-y-2 text-white/70">
            <li>
              <Link to="/shop" className="hover:text-white">
                المتجر
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white">
                مشترياتي
              </Link>
            </li>
            <li>
              <Link
                to={isOwner ? '/owner' : '/owner/login'}
                className="hover:text-white"
              >
                لوحة المالك
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-gold font-semibold mb-3">تواصل</p>
          <ul className="space-y-2 text-white/70">
            <li>{settings.email}</li>
            <li dir="ltr">{settings.phone}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-white/40 py-3">
        © {new Date().getFullYear()} {settings.storeName} · ر.ي/$ · PDF/APK/ZIP
      </div>
    </footer>
  );
}
