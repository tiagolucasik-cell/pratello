import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { OrderStatus } from '../types';
import { STATUS_LABEL } from '../utils/format';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2';

const variants = {
  primary: 'bg-yellow-400 text-zinc-900 hover:bg-yellow-500',
  dark: 'bg-zinc-900 text-white hover:bg-zinc-800',
  ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100',
  outline: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40';

export const Input = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${inputCls} ${className}`} {...props} />
);

export const Textarea = ({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`${inputCls} resize-none ${className}`} {...props} />
);

export const Select = ({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={`${inputCls} ${className}`} {...props} />
);

const statusStyle: Record<OrderStatus, string> = {
  pendente: 'bg-zinc-100 text-zinc-700 ring-zinc-300',
  preparo: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
  pronto: 'bg-green-100 text-green-800 ring-green-300',
  entregue: 'bg-zinc-800 text-zinc-100 ring-zinc-700',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyle[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
