import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label: string;
  className?: string;
}

/**
 * Faixa com rolagem horizontal: arraste/scroll no celular e setas circulares no desktop.
 * As setas só aparecem quando há conteúdo para aquele lado.
 */
export default function HorizontalScroller({ children, label, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  // conteúdo mudou (ex.: filtro) → recalcula as setas
  useEffect(update, [children, update]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const arrow =
    'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-zinc-300 bg-zinc-200 text-zinc-700 shadow-md transition-colors hover:bg-zinc-300 md:grid';

  return (
    <div className="relative">
      <div ref={ref} role="region" aria-label={label} className={`scrollbar-none flex snap-x overflow-x-auto ${className}`}>
        {children}
      </div>
      {canLeft && (
        <button onClick={() => scroll(-1)} className={`${arrow} -left-4`} aria-label="Anterior">
          <ChevronLeft size={18} />
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll(1)} className={`${arrow} -right-4`} aria-label="Próximo">
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
