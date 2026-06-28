'use client';

import { useState } from 'react';
import { MapPin, CalendarDays, Sparkles, X } from 'lucide-react';
import { INTEREST_OPTIONS, BUDGET_OPTIONS } from '@/lib/constants';

/**
 * Trip input form (destination, days, budget type, interests).
 * Rendered inside a modal on the dashboard. Calls `onSubmit` with the payload
 * and shows an AI-generation loading state while the agent works.
 */
export default function TripForm({ onSubmit, onClose, loading }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budgetType, setBudgetType] = useState('Medium');
  const [interests, setInterests] = useState(['Food', 'Culture']);

  const toggleInterest = (i) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const submit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onSubmit({ destination: destination.trim(), days: Number(days), budgetType, interests });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-lg animate-fade-up overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Plan a new trip</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" disabled={loading}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 py-5">
          <div>
            <label className="label">Destination</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="e.g. Tokyo, Japan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Number of days · {days}</label>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <input
                type="range"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="label">Budget level</label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  type="button"
                  key={b.value}
                  onClick={() => setBudgetType(b.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    budgetType === b.value
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-800">{b.label}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-slate-500">{b.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => {
                const active = interests.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`chip border transition ${
                      active
                        ? 'border-brand-500 bg-brand-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" /> Generating itinerary…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate with AI
              </>
            )}
          </button>
          {loading && (
            <p className="text-center text-xs text-slate-400">
              The agent is planning your days, budget and hotels — this can take a few seconds.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
