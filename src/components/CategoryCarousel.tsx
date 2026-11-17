import type { TagId, VisualCategory } from '../types';
import HorizontalScroller from './HorizontalScroller';

interface Props {
  items: VisualCategory[];
  active: TagId | null;
  onSelect: (id: TagId | null) => void;
}

export default function CategoryCarousel({ items, active, onSelect }: Props) {
  return (
    <HorizontalScroller label="Categorias" className="gap-2 px-1 py-2">
      {items.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(isActive ? null : c.id)}
            aria-pressed={isActive}
            className="group flex w-24 shrink-0 snap-start flex-col items-center rounded-xl pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <div className="relative h-[76px] w-24">
              <div
                className={`absolute inset-x-0 top-0 h-14 rounded-t-xl transition-shadow ${isActive ? 'ring-2 ring-yellow-400' : ''}`}
                style={{ backgroundColor: c.color }}
              />
              <img
                src={c.image}
                alt=""
                loading="lazy"
                className="absolute left-1/2 top-3 h-[60px] w-[60px] -translate-x-1/2 rounded-full object-cover shadow-md ring-[3px] ring-white transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span className={`mt-1.5 text-center text-xs leading-tight text-zinc-700 ${isActive ? 'font-bold text-zinc-900' : 'font-medium'}`}>
              {c.name}
            </span>
            <span className={`mt-1 h-1 rounded-full transition-all ${isActive ? 'w-10 bg-yellow-400' : 'w-0 bg-transparent'}`} />
          </button>
        );
      })}
    </HorizontalScroller>
  );
}
