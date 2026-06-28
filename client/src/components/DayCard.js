'use client';

import { useState } from 'react';
import { RefreshCw, Plus, X, Clock, Loader2 } from 'lucide-react';
import { categoryIcon } from '@/lib/constants';

/**
 * One day of the itinerary. In editable mode it exposes:
 *  - remove an activity
 *  - add a new activity (inline form)
 *  - regenerate the whole day with an optional instruction
 */
export default function DayCard({ day, editable, onRegenerate, onAddActivity, onRemoveActivity, busy }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showRegen, setShowRegen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [newActivity, setNewActivity] = useState({ name: '', time: '', category: 'General' });

  const submitAdd = (e) => {
    e.preventDefault();
    if (!newActivity.name.trim()) return;
    onAddActivity(day.day, newActivity);
    setNewActivity({ name: '', time: '', category: 'General' });
    setShowAdd(false);
  };

  const submitRegen = (e) => {
    e.preventDefault();
    onRegenerate(day.day, instruction);
    setInstruction('');
    setShowRegen(false);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            {day.day}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Day {day.day}</p>
            <h3 className="font-semibold text-slate-900">{day.title || `Day ${day.day}`}</h3>
          </div>
        </div>
        {editable && (
          <button
            onClick={() => setShowRegen((s) => !s)}
            disabled={busy}
            className="btn-outline px-3 py-1.5 text-xs"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Regenerate
          </button>
        )}
      </div>

      {showRegen && (
        <form onSubmit={submitRegen} className="border-b border-slate-100 bg-brand-50/40 px-5 py-3">
          <label className="label text-xs">Tell the agent how to change this day</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="e.g. more outdoor activities, fewer museums"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <button type="submit" disabled={busy} className="btn-primary shrink-0">
              Go
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-slate-100">
        {day.activities.map((a) => {
          const Icon = categoryIcon(a.category);
          return (
            <li key={a._id || a.name} className="group flex items-start gap-3 px-5 py-3.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{a.name}</p>
                  {a.time && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" /> {a.time}
                    </span>
                  )}
                </div>
                {a.description && <p className="mt-0.5 text-sm text-slate-500">{a.description}</p>}
                {a.category && a.category !== 'General' && (
                  <span className="chip mt-1.5 bg-slate-100 text-slate-500">{a.category}</span>
                )}
              </div>
              {editable && (
                <button
                  onClick={() => onRemoveActivity(day.day, a._id)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 group-hover:text-slate-400"
                  aria-label="Remove activity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          );
        })}
        {day.activities.length === 0 && (
          <li className="px-5 py-6 text-center text-sm text-slate-400">No activities yet.</li>
        )}
      </ul>

      {editable && (
        <div className="border-t border-slate-100 px-5 py-3">
          {showAdd ? (
            <form onSubmit={submitAdd} className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input"
                placeholder="Activity name"
                value={newActivity.name}
                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                autoFocus
              />
              <input
                className="input sm:w-32"
                placeholder="Time"
                value={newActivity.time}
                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary shrink-0">
                  Add
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost shrink-0">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAdd(true)} className="btn-ghost text-sm text-brand-600">
              <Plus className="h-4 w-4" /> Add activity
            </button>
          )}
        </div>
      )}
    </div>
  );
}
