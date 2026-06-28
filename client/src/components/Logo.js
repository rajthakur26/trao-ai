import { Plane } from 'lucide-react';
import Link from 'next/link';

export default function Logo({ href = '/', light = false }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <Plane className="h-5 w-5 -rotate-45" />
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        Trao<span className="text-brand-500">.ai</span>
      </span>
    </Link>
  );
}
