import { PartyPopper, Star, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Order } from '../types';
import { formatPrice } from '../utils/format';

const COLORS = ['var(--color-yellow-300)', 'var(--color-yellow-500)', 'var(--color-yellow-700)', '#ffffff', '#18181b', '#f43f5e', '#22c55e'];

/** Explosão de confete a partir do centro do elemento pai (que precisa ser `relative`). */
export function Confetti({ count = 70, delay = 0, spread = 1 }: { count?: number; delay?: number; spread?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const power = (120 + Math.random() * 260) * spread;
        return {
          id: i,
          dx: Math.cos(angle) * power,
          dy: Math.sin(angle) * power * 0.7 - 140 * spread,
          rot: (Math.random() - 0.5) * 1080,
          color: COLORS[i % COLORS.length],
          w: 6 + Math.random() * 6,
          round: i % 3 === 0,
          d: delay + Math.random() * 120,
          dur: 1300 + Math.random() * 900,
        };
      }),
    [count, delay, spread],
  );
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 block" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute block"
          style={
            {
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              width: p.w,
              height: p.round ? p.w : p.w * 0.45,
              borderRadius: p.round ? '50%' : 2,
              background: p.color,
              animationDelay: `${p.d}ms`,
              animationDuration: `${p.dur}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

const PLACED_MS = 3000;
const LEAVE_MS = 650;

/**
 * Animação ao finalizar o pedido: tela na cor de destaque, círculo com o ✓ sendo desenhado,
 * confete e o resumo. Some com um círculo se fechando e revela o rastreio. Toque para pular.
 */
export function OrderPlacedSplash({ order, onDone }: { order: Order; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = reduced ? 1200 : PLACED_MS;
    const t1 = setTimeout(() => setLeaving(true), show);
    const t2 = setTimeout(onDone, show + LEAVE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDelivery = order.location.mode === 'delivery';
  return (
    <div
      className={`placed-root fixed inset-0 z-[100] grid cursor-pointer place-items-center overflow-hidden bg-yellow-400 px-6 text-center text-zinc-900 ${leaving ? 'placed-leave' : ''}`}
      onClick={() => {
        if (leaving) return;
        setLeaving(true);
        setTimeout(onDone, LEAVE_MS);
      }}
      role="status"
      aria-live="polite"
      aria-label={`Pedido número ${order.number} confirmado`}
    >
      {[0, 1].map((i) => (
        <span key={i} className="placed-wave absolute left-1/2 top-1/2 h-40 w-40 rounded-full bg-white/30" style={{ animationDelay: `${350 + i * 260}ms` }} />
      ))}

      <div className="relative flex flex-col items-center">
        <div className="relative">
          <Confetti delay={700} />
          <span className="placed-circle grid h-32 w-32 place-items-center rounded-full bg-white shadow-2xl shadow-yellow-700/40">
            <svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden="true">
              <path className="placed-check" d="M14 27 l8 8 l17 -18" fill="none" stroke="#18181b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h1 className="placed-up mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ animationDelay: '800ms' }}>
          Pedido confirmado!
        </h1>
        <p className="placed-up mt-2 text-lg font-semibold" style={{ animationDelay: '950ms' }}>
          #{order.number} · {formatPrice(order.total)}
        </p>
        <p className="placed-up mt-1 text-sm text-zinc-800/80" style={{ animationDelay: '1100ms' }}>
          {isDelivery ? 'O restaurante já recebeu. Acompanhe a entrega no mapa.' : 'A cozinha já recebeu. Acompanhe o preparo em tempo real.'}
        </p>
        <p className="placed-up mt-8 text-[11px] text-zinc-800/60" style={{ animationDelay: '1400ms' }}>
          toque para continuar
        </p>
      </div>
    </div>
  );
}

/** Comemoração quando o pedido chega: confete, mensagem e avaliação com estrelas. */
export function DeliveredCelebration({ order, onClose }: { order: Order; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(false);
  const firstName = order.customerName.split(' ')[0];
  const isDelivery = order.location.mode === 'delivery';

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-zinc-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="delivered-card relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 pt-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivered-title"
      >
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100" aria-label="Fechar">
          <X size={18} />
        </button>
        <div className="relative mx-auto w-fit">
          <Confetti count={60} delay={150} spread={0.8} />
          <span className="delivered-icon grid h-20 w-20 place-items-center rounded-full bg-yellow-400 text-zinc-900">
            <PartyPopper size={38} strokeWidth={2.2} />
          </span>
        </div>
        <h2 id="delivered-title" className="mt-5 text-2xl font-extrabold text-zinc-900">
          {isDelivery ? 'Pedido entregue!' : 'Pedido servido!'}
        </h2>
        <p className="mt-1 text-zinc-600">Bom apetite, {firstName}! 😋</p>

        {sent ? (
          <p className="mt-6 rounded-xl bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-900 ring-1 ring-yellow-200">
            Obrigado pela avaliação! {'⭐'.repeat(rating)}
          </p>
        ) : (
          <>
            <p className="mt-6 text-sm font-semibold text-zinc-900">Como foi seu pedido?</p>
            <div className="mt-2 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  className="rounded-lg p-1 transition-transform hover:scale-110"
                  aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
                >
                  <Star size={30} className={(hover || rating) >= n ? 'text-yellow-400' : 'text-zinc-300'} fill="currentColor" />
                </button>
              ))}
            </div>
            <button
              disabled={!rating}
              onClick={() => setSent(true)}
              className="mt-5 w-full rounded-xl bg-yellow-400 py-3 font-bold text-zinc-900 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar avaliação
            </button>
          </>
        )}
      </div>
    </div>
  );
}
