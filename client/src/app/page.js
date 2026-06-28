'use client';

import Link from 'next/link';
import {
  Sparkles,
  Wallet,
  MapPinned,
  MessageSquareHeart,
  Hotel,
  Share2,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const FEATURES = [
  {
    icon: MapPinned,
    title: 'Day-by-day itineraries',
    body: 'An AI agent crafts a realistic, well-paced plan tailored to your interests and trip length.',
  },
  {
    icon: Wallet,
    title: 'Smart budget estimates',
    body: 'Flights, stays, food, activities and transport — broken down and totalled for your budget level.',
  },
  {
    icon: MessageSquareHeart,
    title: 'AI Concierge editing',
    body: 'Just chat: “make day 3 more outdoorsy” or “add a sushi dinner”. The agent edits the plan for you.',
  },
  {
    icon: Hotel,
    title: 'Hotel suggestions',
    body: 'Budget, mid-range and luxury picks with ratings and nightly prices for your destination.',
  },
  {
    icon: Sparkles,
    title: 'Regenerate any day',
    body: 'Not feeling a day? Regenerate it with a one-line instruction and keep the rest intact.',
  },
  {
    icon: Share2,
    title: 'Shareable trips',
    body: 'Publish a read-only link so friends can view your itinerary — no account needed.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div className="absolute -top-24 right-0 -z-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
            <Sparkles className="h-4 w-4" /> Powered by an LLM travel agent
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Plan your perfect trip in{' '}
            <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
              seconds
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Tell Trao where you’re going, for how long, and what you love. Get a complete
            day-by-day itinerary, a budget breakdown, and hotel picks — then refine it just by
            chatting.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Start planning free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-outline px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition hover:shadow-md">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Built with Next.js, Express, MongoDB & Groq · Trao.ai
      </footer>
    </div>
  );
}
