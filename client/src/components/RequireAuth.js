'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from './Spinner';

/**
 * Client-side route guard. Redirects unauthenticated users to /login once the
 * auth state has finished loading. (The backend independently enforces auth on
 * every protected request — this is purely for UX.)
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Loading your workspace…" />
      </div>
    );
  }
  return children;
}
