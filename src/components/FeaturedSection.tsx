import { ChevronRight, Clock, Flame, Star } from 'lucide-react';
import type { Category, Product } from '../types';
import { discountPercent, formatPrice, prepRange } from '../utils/format';
import HorizontalScroller from './HorizontalScroller';
import ProductImage from './ProductImage';

interface Props {
  products: Product[];
  categories: Category[];
  onOpen: (product: Product) => void;
  onSeeMore: () => void;
}

export default function FeaturedSection({ products, categories, onOpen, onSeeMore }: Props) {
  if (products.length === 0) return null;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900">Destaques do Pratello</h2>
          <p className="text-sm text-zinc-500">Os mais pedidos pelos nossos clientes</p>
        </div>
        <button onClick={onSeeMore} className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-yellow-600 hover:text-yellow-700">
          Ver mais <ChevronRight size={16} />
        </button>
      </div>

      <HorizontalScroller label="Destaques" className="gap-3 px-1 py-1">
        {products.map((p) => {
          const off = discountPercent(p.price, p.originalPrice);
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="flex w-72 shrink-0 snap-start items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <ProductImage src={p.image} alt={p.name} className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-zinc-900">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                  {p.popular ? <Star size={12} className="fill-yellow-400 text-yellow-400" /> : <Flame size={12} className="text-yellow-500" />}
                  {catName(p.category)} · <Clock size={12} /> {prepRange(p.prepTime)}
                </p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-extrabold text-zinc-900">{formatPrice(p.price)}</span>
                  {off > 0 && <span className="text-xs text-zinc-400 line-through">{formatPrice(p.originalPrice!)}</span>}
                  {off > 0 && <span className="rounded bg-yellow-400 px-1 text-[10px] font-bold text-zinc-900">-{off}%</span>}
                </p>
              </div>
            </button>
          );
        })}
      </HorizontalScroller>
    </section>
  );
}
