'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CalendarDays, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import DayCard from '@/components/DayCard';
import BudgetPanel from '@/components/BudgetPanel';
import HotelList from '@/components/HotelList';
import Spinner from '@/components/Spinner';
import { api } from '@/lib/api';

export default function SharedTripPage() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { trip } = await api.getSharedTrip(token);
        setTrip(trip);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Loading shared trip…" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Trip not found</h1>
          <p className="mt-1 text-slate-500">{error || 'This share link is no longer active.'}</p>
          <Link href="/" className="btn-primary mt-6">
            Go to Trao.ai
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <Link href="/register" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Plan your own trip
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="card mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-sky-500 px-6 py-5 text-white">
            <span className="chip mb-2 bg-white/20 text-white">Shared itinerary · read-only</span>
            <h1 className="text-2xl font-bold">{trip.title}</h1>
            <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-brand-50">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {trip.destination}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {trip.days} days
              </span>
              <span className="chip bg-white/20 text-white">{trip.budgetType} budget</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Itinerary</h2>
            {trip.itinerary.map((day) => (
              <DayCard key={day.day} day={day} editable={false} />
            ))}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <BudgetPanel budget={trip.budget} />
            <HotelList hotels={trip.hotels} currency={trip.budget?.currency} />
          </aside>
        </div>
      </main>
    </div>
  );
}
