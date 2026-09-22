import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Menu, ShoppingCart, Store, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import CurrencySwitch from './CurrencySwitch';

export default function Navbar() {
  const { count } = useCart();
  const { settings, isOwner } = useStore();
  const [open, setOpen] = useState(false);
  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/shop', label: 'المتجر' },
    { to: '/orders', label: 'مشترياتي' },
    { to: '/about', label: 'عن المتجر' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-navy/8 shadow-sm">
      <div className="bg-navy text-white text-[11px]">
        <div className="mx-auto max-w-6xl px-4 py-1.5 flex justify-between gap-2">
          <span>متجر رقمي · كتب · تطبيقات · ملفات حتى 500MB</span>
          <span className="hidden sm:inline opacity-80">ر.ي و $ · دفع يمني</span>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-gold">
            <Store className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <span className="block font-display font-bold text-navy">
              {settings.storeName}
            </span>
            <span className="block text-[10px] text-muted">{settings.tagline}</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-navy text-white' : 'text-muted hover:bg-navy/5 hover:text-navy'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <CurrencySwitch />
          </div>
          <Link
            to={isOwner ? '/owner' : '/owner/login'}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-navy/10 text-navy hover:bg-navy hover:text-white"
            title="المالك"
          >
            <LayoutDashboard className="w-4 h-4" />
          </Link>
          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white"
          >
            <ShoppingCart className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="md:hidden h-9 w-9 rounded-full border border-navy/10 flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-navy/8 px-4 py-3 space-y-1 bg-white">
          <div className="flex justify-center pb-2">
            <CurrencySwitch />
          </div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-navy text-white' : 'hover:bg-navy/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to={isOwner ? '/owner' : '/owner/login'}
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium bg-gold-soft text-navy"
          >
            {isOwner ? 'لوحة التحكم' : 'دخول المالك'}
          </Link>
        </div>
      )}
    </header>
  );
}
