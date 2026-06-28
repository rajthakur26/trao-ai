'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthShell, Field } from '../login/page';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start planning smarter trips in seconds.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={User}
          label="Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Jane Traveller"
        />
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
          autoComplete="new-password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          placeholder="At least 8 characters"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
