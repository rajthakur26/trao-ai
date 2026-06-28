'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue planning your trips.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={Mail}
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="you@example.com"
        />
        <Field
          icon={Lock}
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="••••••••"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-700 p-10 text-white lg:flex">
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl" />
        <Logo light />
        <div className="relative z-10">
          <h2 className="max-w-sm text-3xl font-bold leading-tight">
            Your next adventure, planned by AI.
          </h2>
          <p className="mt-3 max-w-sm text-brand-100">
            Itineraries, budgets and hotels — generated in seconds and refined by chatting with
            your travel concierge.
          </p>
        </div>
        <p className="relative z-10 text-sm text-brand-200">Trao.ai · AI Travel Planner</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, label, value, onChange, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          className={`input ${Icon ? 'pl-9' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          {...props}
        />
      </div>
    </div>
  );
}
