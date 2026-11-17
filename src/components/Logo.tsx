import { Utensils } from 'lucide-react';

export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-zinc-900">
        <Utensils size={20} strokeWidth={2.5} />
      </span>
      <span className={`text-2xl ${light ? 'text-white' : 'text-zinc-900'}`}>Pratello</span>
    </span>
  );
}
