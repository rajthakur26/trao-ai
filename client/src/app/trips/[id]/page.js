'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, CalendarDays, Share2, Check, Copy, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import DayCard from '@/components/DayCard';
import BudgetPanel from '@/components/BudgetPanel';
import HotelList from '@/components/HotelList';
import ConciergeChat from '@/components/ConciergeChat';
import Spinner from '@/components/Spinner';
import { api } from '@/lib/api';

function TripInner() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyDay, setBusyDay] = useState(null);
  const [conciergeBusy, setConciergeBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { trip } = await api.getTrip(id);
        setTrip(trip);
      } catch (err) {
        toast.error(err.message);
        if (err.status === 404) router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleRegenerate = async (day, instruction) => {
    setBusyDay(day);
    try {
      const { trip } = await api.regenerateDay(id, day, instruction);
      setTrip(trip);
      toast.success(`Day ${day} regenerated`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyDay(null);
    }
  };

  const handleAddActivity = async (day, activity) => {
    try {
      const { trip } = await api.addActivity(id, day, activity);
      setTrip(trip);
      toast.success('Activity added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveActivity = async (day, activityId) => {
    try {
      const { trip } = await api.removeActivity(id, day, activityId);
      setTrip(trip);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleConcierge = async (message) => {
    setConciergeBusy(true);
    try {
      const { trip, reply, applied } = await api.concierge(id, message);
      setTrip(trip);
      return { reply, applied };
    } finally {
      setConciergeBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Loading your trip…" />
      </div>
    );
  }
  if (!trip) return null;

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <button onClick={() => router.push('/dashboard')} className="btn-ghost mb-4 -ml-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        {/* Header */}
        <div className="card mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-sky-500 px-6 py-5 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
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
              <button
                onClick={() => setShareOpen(true)}
                className="btn inline-flex shrink-0 bg-white/15 text-white hover:bg-white/25"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
            {trip.interests?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {trip.interests.map((i) => (
                  <span key={i} className="chip bg-white/15 text-white">
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body: itinerary + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Your itinerary</h2>
            {trip.itinerary.map((day) => (
              <DayCard
                key={day.day}
                day={day}
                editable
                busy={busyDay === day.day}
                onRegenerate={handleRegenerate}
                onAddActivity={handleAddActivity}
                onRemoveActivity={handleRemoveActivity}
              />
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <ConciergeChat onSend={handleConcierge} busy={conciergeBusy} />
            <BudgetPanel budget={trip.budget} />
            <HotelList hotels={trip.hotels} currency={trip.budget?.currency} />
          </aside>
        </div>
      </main>

      {shareOpen && <ShareModal trip={trip} setTrip={setTrip} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function ShareModal({ trip, setTrip, onClose }) {
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl =
    trip.shareToken && typeof window !== 'undefined'
      ? `${window.location.origin}/shared/${trip.shareToken}`
      : '';

  const toggle = async (enabled) => {
    setWorking(true);
    try {
      const { shareToken } = await api.setShare(trip._id, enabled);
      setTrip({ ...trip, shareToken });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWorking(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md animate-fade-up p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Share this trip</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500">
          Create a public, read-only link anyone can open — no account required.
        </p>

        {trip.shareToken ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <input className="input bg-slate-50 text-xs" value={shareUrl} readOnly />
              <button onClick={copy} className="btn-primary shrink-0 px-3">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button onClick={() => toggle(false)} disabled={working} className="btn-danger w-full">
              Disable link
            </button>
          </div>
        ) : (
          <button onClick={() => toggle(true)} disabled={working} className="btn-primary mt-4 w-full">
            {working ? 'Creating…' : 'Create share link'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TripPage() {
  return (
    <RequireAuth>
      <TripInner />
    </RequireAuth>
  );
}
