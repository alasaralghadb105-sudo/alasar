import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  LogOut,
  Package,
  Settings,
  Store,
  Wallet,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const nav = [
  { to: '/owner', end: true, label: 'الرئيسية', icon: LayoutDashboard },
  { to: '/owner/products', end: false, label: 'المنتجات', icon: Package },
  { to: '/owner/products/bulk', end: false, label: 'رفع متعدد', icon: Layers },
  { to: '/owner/orders', end: false, label: 'الطلبات', icon: Store },
  { to: '/owner/payments', end: false, label: 'الدفع', icon: Wallet },
  { to: '/owner/settings', end: false, label: 'إعدادات', icon: Settings },
];

export default function OwnerLayout() {
  const { isOwner, logout, settings } = useStore();
  if (!isOwner) return <Navigate to="/owner/login" replace />;

  return (
    <div className="min-h-screen bg-[#f0ebe3] flex flex-col lg:flex-row">
      <aside className="lg:w-56 bg-navy text-white shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="font-display font-bold">{settings.storeName}</p>
          <p className="text-[11px] text-white/50">لوحة المالك</p>
        </div>
        <nav className="p-2 flex lg:flex-col gap-1 overflow-x-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap ${
                  isActive ? 'bg-white/15 text-white font-bold' : 'text-white/70 hover:bg-white/10'
                }`
              }
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-white/10 mt-auto hidden lg:block">
          <Link to="/" className="block text-sm text-white/70 px-3 py-2 hover:text-white">
            عرض المتجر
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm text-rose-300 px-3 py-2"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
