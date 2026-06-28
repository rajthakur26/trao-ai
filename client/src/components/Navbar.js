'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo href={user ? '/dashboard' : '/'} />
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 md:inline-flex">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                {user.name}
              </span>
              <button onClick={handleLogout} className="btn-outline">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
