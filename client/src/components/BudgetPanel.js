import { Plane, BedDouble, UtensilsCrossed, Ticket, Bus, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';

const ROWS = [
  { key: 'flights', label: 'Flights', icon: Plane },
  { key: 'accommodation', label: 'Accommodation', icon: BedDouble },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'activities', label: 'Activities', icon: Ticket },
  { key: 'transport', label: 'Transport', icon: Bus },
];

export default function BudgetPanel({ budget }) {
  if (!budget) return null;
  const currency = budget.currency || 'USD';
  const max = Math.max(...ROWS.map((r) => budget[r.key] || 0), 1);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold text-slate-900">Estimated budget</h3>
      </div>

      <div className="space-y-3">
        {ROWS.map((r) => {
          const value = budget[r.key] || 0;
          return (
            <div key={r.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <r.icon className="h-4 w-4 text-slate-400" /> {r.label}
                </span>
                <span className="font-medium text-slate-800">{formatCurrency(value, currency)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="font-semibold text-slate-900">Total</span>
        <span className="text-xl font-bold text-brand-700">
          {formatCurrency(budget.total, currency)}
        </span>
      </div>
      {budget.notes && <p className="mt-2 text-xs leading-relaxed text-slate-400">{budget.notes}</p>}
    </div>
  );
}
