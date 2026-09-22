import { useStore } from '../context/StoreContext';
import type { CurrencyMode } from '../data/store';

const opts: { id: CurrencyMode; label: string }[] = [
  { id: 'both', label: 'ر.ي/$' },
  { id: 'YER', label: 'ر.ي' },
  { id: 'USD', label: '$' },
];

export default function CurrencySwitch() {
  const { currency, setCurrency } = useStore();
  return (
    <div className="inline-flex rounded-full border border-navy/10 bg-white p-0.5 shadow-sm">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setCurrency(o.id)}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-colors ${
            currency === o.id
              ? 'bg-navy text-white'
              : 'text-muted hover:text-navy'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
