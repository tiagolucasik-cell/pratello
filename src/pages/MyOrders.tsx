import { Armchair, ArrowLeft, Bike, ChevronRight, MapPin, Receipt, RotateCcw, Star } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Order } from '../types';
import { formatLocation, formatPrice, formatTime, isToday, STATUS_STEP, trackingLabel } from '../utils/format';

const formatWhen = (t: number) =>
  isToday(t) ? `Hoje, ${formatTime(t)}` : new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + `, ${formatTime(t)}`;

/** Lista de pedidos do cliente: em andamento (com acesso ao rastreio) e histórico. */
export default function MyOrders() {
  const { orders, session, addToCart, products } = useApp();
  const navigate = useNavigate();
  const clientId = session?.type === 'cliente' ? session.clientId : '';
  const mine = useMemo(() => orders.filter((o) => o.clientId === clientId).sort((a, b) => b.createdAt - a.createdAt), [orders, clientId]);
  const active = mine.filter((o) => o.status !== 'entregue');
  const past = mine.filter((o) => o.status === 'entregue');

  const reorder = (o: Order) => {
    o.items.forEach((it) => {
      if (products.some((p) => p.id === it.productId && p.available)) addToCart(it.productId, it.quantity);
    });
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/cardapio" className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100" aria-label="Voltar ao cardápio">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-extrabold text-zinc-900">Meus pedidos</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 sm:px-6">
        {mine.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-zinc-100 text-zinc-500">
              <Receipt size={24} />
            </div>
            <p className="font-bold text-zinc-900">Você ainda não fez pedidos</p>
            <p className="mt-1 text-sm text-zinc-600">Quando pedir, você acompanha tudo por aqui.</p>
            <Link to="/cardapio" className="mt-5 inline-flex rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-yellow-500">
              Ver cardápio
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-yellow-500" />
              </span>
              Em andamento
            </h2>
            <ul className="space-y-3">
              {active.map((o) => (
                <li key={o.id}>
                  <Link to={`/pedido/${o.id}`} className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 transition hover:ring-yellow-400">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-900 text-yellow-400">
                        {o.location.mode === 'delivery' ? <Bike size={20} /> : <Armchair size={20} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-zinc-900">{trackingLabel(o)}</p>
                        <p className="truncate text-xs text-zinc-500">
                          Pedido #{o.number} · {formatWhen(o.createdAt)} · {formatPrice(o.total)}
                        </p>
                      </div>
                      <span className="hidden items-center gap-1 rounded-xl bg-yellow-400 px-3 py-2 text-xs font-bold text-zinc-900 sm:flex">
                        {o.location.mode === 'delivery' ? <MapPin size={14} /> : null} Acompanhar
                      </span>
                      <ChevronRight size={18} className="text-zinc-400 sm:hidden" />
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className="relative h-1.5 overflow-hidden rounded-full bg-zinc-200">
                          {i < STATUS_STEP[o.status] && <span className="absolute inset-0 bg-yellow-400" />}
                          {i === STATUS_STEP[o.status] && <span className="track-shimmer absolute inset-0 bg-yellow-400" />}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">Anteriores</h2>
            <ul className="space-y-3">
              {past.map((o) => (
                <li key={o.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
                  <Link to={`/pedido/${o.id}`} className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500">
                      {o.location.mode === 'delivery' ? <Bike size={20} /> : <Armchair size={20} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-900">
                        {trackingLabel(o)} · <span className="font-semibold text-zinc-500">{formatWhen(o.updatedAt)}</span>
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        #{o.number} · {o.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </p>
                      <p className="truncate text-xs text-zinc-400">{formatLocation(o.location)}</p>
                      {o.rating ? (
                        <span className="mt-1 flex gap-0.5" aria-label={`Avaliado com ${o.rating} estrelas`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} size={13} className={n <= o.rating! ? 'text-yellow-400' : 'text-zinc-300'} fill="currentColor" />
                          ))}
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-yellow-700">
                          <Star size={12} /> Avaliar pedido
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-zinc-900">{formatPrice(o.total)}</span>
                  </Link>
                  <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3">
                    <Link to={`/pedido/${o.id}`} className="flex-1 rounded-xl bg-zinc-100 py-2 text-center text-sm font-semibold text-zinc-700 hover:bg-zinc-200">
                      Ver detalhes
                    </Link>
                    <button onClick={() => reorder(o)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-yellow-400 py-2 text-sm font-bold text-zinc-900 hover:bg-yellow-500">
                      <RotateCcw size={14} /> Pedir de novo
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
