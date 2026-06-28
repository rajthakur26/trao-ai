'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, MapPin, CalendarDays, Wallet, Trash2, Plane } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import TripForm from '@/components/TripForm';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/constants';

function DashboardInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const { trips } = await api.listTrips();
      setTrips(trips);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (payload) => {
    setCreating(true);
    try {
      const { trip, meta } = await api.createTrip(payload);
      toast.success(meta?.source === 'mock' ? 'Trip created (offline demo mode)' : 'Itinerary generated!');
      router.push(`/trips/${trip._id}`);
    } catch (err) {
      toast.error(err.message);
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    try {
      await api.deleteTrip(id);
      setTrips((t) => t.filter((x) => x._id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Hi {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="mt-1 text-slate-500">Your trips, all in one place.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary self-start sm:self-auto">
            <Plus className="h-4 w-4" /> New trip
          </button>
        </div>

        <div className="mt-8">
          {loading ? (
            <SkeletonGrid />
          ) : trips.length === 0 ? (
            <EmptyState onCreate={() => setShowForm(true)} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <Link
                  key={trip._id}
                  href={`/trips/${trip._id}`}
                  className="card group relative flex flex-col overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-400 text-white">
                    <Plane className="h-8 w-8 -rotate-45 opacity-90" />
                  </div>
                  <h3 className="line-clamp-1 font-semibold text-slate-900">{trip.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {trip.destination}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {trip.days}d
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                      <Wallet className="h-3.5 w-3.5 text-brand-600" />
                      {formatCurrency(trip.budget?.total, trip.budget?.currency)}
                    </span>
                    <span className="chip bg-slate-100 text-slate-600">{trip.budgetType}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, trip._id)}
                    className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 text-slate-400 opacity-0 shadow-sm transition hover:text-rose-600 group-hover:opacity-100"
                    aria-label="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <TripForm onSubmit={handleCreate} onClose={() => !creating && setShowForm(false)} loading={creating} />
      )}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Plane className="h-7 w-7 -rotate-45" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No trips yet</h3>
      <p className="mt-1 max-w-sm text-slate-500">
        Create your first AI-generated itinerary. Tell us where you’re headed and we’ll handle the rest.
      </p>
      <button onClick={onCreate} className="btn-primary mt-6">
        <Plus className="h-4 w-4" /> Plan your first trip
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="skeleton mb-3 h-24 rounded-xl" />
          <div className="skeleton mb-2 h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
