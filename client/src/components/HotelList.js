import { Hotel, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';

const TIER_STYLES = {
  'Budget Friendly': 'bg-emerald-50 text-emerald-700',
  'Mid Range': 'bg-amber-50 text-amber-700',
  Luxury: 'bg-violet-50 text-violet-700',
};

export default function HotelList({ hotels = [], currency = 'USD' }) {
  if (!hotels.length) return null;
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Hotel className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold text-slate-900">Recommended hotels</h3>
      </div>
      <div className="space-y-3">
        {hotels.map((h, i) => (
          <div key={i} className="rounded-xl border border-slate-100 p-3.5 transition hover:border-slate-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{h.name}</p>
                <span className={`chip mt-1 ${TIER_STYLES[h.tier] || 'bg-slate-100 text-slate-600'}`}>
                  {h.tier}
                </span>
              </div>
              {h.rating > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {h.rating.toFixed(1)}
                </span>
              )}
            </div>
            {h.description && <p className="mt-2 text-sm text-slate-500">{h.description}</p>}
            {h.pricePerNight > 0 && (
              <p className="mt-2 text-sm font-semibold text-slate-700">
                {formatCurrency(h.pricePerNight, currency)}{' '}
                <span className="font-normal text-slate-400">/ night</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
