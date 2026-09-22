import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function AboutPage() {
  const { settings } = useStore();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-navy mb-3">
        عن {settings.storeName}
      </h1>
      <p className="text-muted leading-relaxed mb-6">{settings.about}</p>
      <p className="text-sm text-navy font-semibold mb-8">
        المالك: {settings.ownerName}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/shop" className="rounded-xl bg-navy text-white font-bold px-5 py-2.5 text-sm">
          المتجر
        </Link>
        <Link
          to="/owner/login"
          className="rounded-xl border border-navy/15 text-navy font-bold px-5 py-2.5 text-sm"
        >
          دخول المالك
        </Link>
      </div>
    </div>
  );
}
