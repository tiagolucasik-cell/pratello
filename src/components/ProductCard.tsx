import { Clock, Flame, Plus } from 'lucide-react';
import type { Product } from '../types';
import { discountPercent, formatPrice, prepRange } from '../utils/format';
import ProductImage from './ProductImage';

interface Props {
  product: Product;
  inCart: number;
  onAdd: () => void;
  onOpen: () => void;
}

export default function ProductCard({ product, onAdd, onOpen, inCart }: Props) {
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button onClick={onOpen} className="relative block overflow-hidden text-left" aria-label={`Ver detalhes de ${product.name}`}>
        <ProductImage src={product.image} alt={product.name} className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-zinc-900 shadow">
              <Flame size={12} /> Mais pedido
            </span>
          )}
          {off > 0 && <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-yellow-400 shadow">-{off}%</span>}
        </div>
        {inCart > 0 && (
          <span className="absolute right-3 top-3 grid h-7 min-w-7 place-items-center rounded-full bg-zinc-900 px-2 text-xs font-bold text-white">
            {inCart}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <button onClick={onOpen} className="text-left">
          <h3 className="font-bold text-zinc-900 hover:underline">{product.name}</h3>
        </button>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-zinc-600">{product.description}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
          <Clock size={12} /> {prepRange(product.prepTime)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
            {off > 0 && <span className="text-xs text-zinc-400 line-through">{formatPrice(product.originalPrice!)}</span>}
          </div>
          <button
            onClick={onAdd}
            aria-label={`Adicionar ${product.name}`}
            className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-zinc-900 transition-colors hover:bg-yellow-500 active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
