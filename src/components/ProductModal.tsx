import { Clock, Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { discountPercent, formatPrice, prepRange } from '../utils/format';
import ProductImage from './ProductImage';

interface Props {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
}

/** Detalhes do prato com seletor de quantidade (estilo marketplace). */
export default function ProductModal({ product, onClose, onAdd }: Props) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/60 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-3xl sm:flex-row sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 sm:w-1/2">
          <ProductImage src={product.image} alt={product.name} className="h-56 w-full sm:h-full" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-700 shadow hover:bg-white sm:hidden"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-zinc-900">{product.name}</h2>
              <button onClick={onClose} className="hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 sm:block" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{product.description}</p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-sm text-zinc-400 line-through">{formatPrice(product.originalPrice!)}</span>
                  <span className="rounded-md bg-yellow-400 px-1.5 py-0.5 text-xs font-bold text-zinc-900">-{off}%</span>
                </>
              )}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500">
              <Clock size={14} /> Preparo estimado: {prepRange(product.prepTime)}
            </p>

            {product.ingredients.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Ingredientes</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((i) => (
                    <span key={i} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-200 p-4">
            <div className="flex items-center rounded-xl border border-zinc-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-zinc-600 hover:bg-zinc-100" aria-label="Diminuir">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 text-zinc-600 hover:bg-zinc-100" aria-label="Aumentar">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => onAdd(product, qty)}
              className="flex flex-1 items-center justify-between rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-yellow-500"
            >
              <span>Adicionar</span>
              <span>{formatPrice(product.price * qty)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
