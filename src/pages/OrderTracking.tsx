import {
  ArrowLeft,
  Bell,
  Bike,
  ChefHat,
  CircleCheck,
  ClipboardCheck,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Receipt,
  Square,
  Star,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DeliveredCelebration, OrderPlacedSplash } from '../components/Celebration';
import DeliveryMap, { courierFraction, type CourierState } from '../components/DeliveryMap';
import { useApp } from '../context/AppContext';
import type { Order, OrderStatus } from '../types';
import { formatLocation, formatLocationFull, formatPayment, formatPrice, formatTime } from '../utils/format';
import { getRestaurant, getRoute, locateCustomer, type LatLng, type Route } from '../utils/geo';

/** Tempo da animação do entregador no mapa (demo: 1 minuto, mas o texto mostra o tempo real da rota). */
const RIDE_MS = 60_000;
/** Tempos do modo apresentação até avançar cada etapa. */
const SIM_DELAY: Partial<Record<OrderStatus, number>> = { pendente: 2500, preparo: 5000 };

const STEPS: { status: OrderStatus; delivery: string; mesa: string; icon: LucideIcon }[] = [
  { status: 'pendente', delivery: 'Pedido recebido', mesa: 'Pedido enviado à cozinha', icon: ClipboardCheck },
  { status: 'preparo', delivery: 'Em preparo', mesa: 'Em preparo', icon: ChefHat },
  { status: 'pronto', delivery: 'Saiu para entrega', mesa: 'A caminho da mesa', icon: Bike },
  { status: 'entregue', delivery: 'Entregue', mesa: 'Servido', icon: CircleCheck },
];

const HEADLINE: Record<OrderStatus, { delivery: string; mesa: string; sub: { delivery: string; mesa: string } }> = {
  pendente: {
    delivery: 'Aguardando o restaurante',
    mesa: 'Pedido enviado!',
    sub: { delivery: 'O restaurante vai confirmar seu pedido em instantes.', mesa: 'A cozinha vai começar a preparar em instantes.' },
  },
  preparo: {
    delivery: 'Preparando seu pedido',
    mesa: 'Preparando seu pedido',
    sub: { delivery: 'O entregador já está aguardando no restaurante.', mesa: 'Nossos chefs estão caprichando no seu prato.' },
  },
  pronto: {
    delivery: 'Saiu para entrega',
    mesa: 'Pronto! Indo para a sua mesa',
    sub: { delivery: 'Acompanhe o entregador pelo mapa.', mesa: 'O garçom já está levando seu pedido.' },
  },
  entregue: {
    delivery: 'Pedido entregue',
    mesa: 'Pedido servido',
    sub: { delivery: 'Bom apetite! Obrigado por pedir no Pratello.', mesa: 'Bom apetite! Obrigado por pedir no Pratello.' },
  },
};

const COURIERS = [
  { name: 'Carlos Henrique', bike: 'Honda CG 160', plate: 'FPX-2B41' },
  { name: 'Juliana Souza', bike: 'Yamaha Factor 150', plate: 'GHT-7C19' },
  { name: 'Rafael Lima', bike: 'Honda Biz 125', plate: 'QWE-4D88' },
  { name: 'Patrícia Alves', bike: 'Honda Pop 110i', plate: 'RTA-1E05' },
  { name: 'Diego Martins', bike: 'Yamaha Fazer 250', plate: 'BKS-9F72' },
];

const pickCourier = (id: string) => COURIERS[[...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 3) % COURIERS.length];

const addMin = (t: number, m: number) => t + m * 60_000;

/** Coordenadas do restaurante/cliente e a rota, buscadas uma vez por pedido. */
function useDeliveryGeo(order: Order | undefined) {
  const [geo, setGeo] = useState<{ restaurant: LatLng; customer: LatLng | null; route: Route | null; approximate: boolean }>(() => {
    const r = getRestaurant();
    return { restaurant: [r.lat, r.lng], customer: null, route: null, approximate: false };
  });
  const address = order?.location.mode === 'delivery' ? order.location.address : null;
  const addressKey = address ? `${address.cep}|${address.street}|${address.number}|${address.district}` : '';

  useEffect(() => {
    if (!address) return;
    const ctrl = new AbortController();
    const r = getRestaurant();
    const restaurant: LatLng = [r.lat, r.lng];
    (async () => {
      const customer = await locateCustomer(address, restaurant, ctrl.signal);
      setGeo({ restaurant, customer: customer.point, route: null, approximate: customer.approximate });
      const route = await getRoute(restaurant, customer.point, ctrl.signal);
      setGeo({ restaurant, customer: customer.point, route, approximate: customer.approximate });
    })().catch((e: unknown) => {
      if ((e as Error).name !== 'AbortError') console.error(e);
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey]);

  return geo;
}

/** Atualiza a tela periodicamente (contagem de minutos). */
function useNow(ms: number) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export default function OrderTracking() {
  const { id } = useParams();
  const { orders, session, advanceOrder } = useApp();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === id);
  const justPlaced = (routerLocation.state as { placed?: boolean } | null)?.placed === true;
  const geo = useDeliveryGeo(order);
  const now = useNow(1000);
  const [simulate, setSimulate] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // comemora quando o status muda para "entregue" com a página aberta
  const prevStatus = useRef(order?.status);
  useEffect(() => {
    if (order && prevStatus.current && prevStatus.current !== 'entregue' && order.status === 'entregue') setCelebrate(true);
    prevStatus.current = order?.status;
  }, [order?.status, order]);

  // modo apresentação: avança as etapas sozinho
  useEffect(() => {
    if (!simulate || !order) return;
    if (order.status === 'entregue') return setSimulate(false);
    const delay = order.status === 'pronto' ? (order.location.mode === 'delivery' ? Math.max(0, RIDE_MS - (Date.now() - order.updatedAt)) + 400 : 4000) : SIM_DELAY[order.status]!;
    const t = setTimeout(() => advanceOrder(order.id), delay);
    return () => clearTimeout(t);
  }, [simulate, order, advanceOrder]);

  const courier = useMemo<CourierState>(() => {
    if (!order) return { mode: 'hidden' };
    if (order.status === 'entregue') return { mode: 'arrived' };
    if (order.status === 'pronto') return { mode: 'riding', start: order.updatedAt, ms: RIDE_MS };
    if (order.status === 'preparo') return { mode: 'waiting' };
    return { mode: 'hidden' };
  }, [order]);

  if (!order || session?.type !== 'cliente' || order.clientId !== session.clientId) return <Navigate to="/cardapio" replace />;

  const isDelivery = order.location.mode === 'delivery';
  const kind = isDelivery ? 'delivery' : 'mesa';
  const stepIndex = STEPS.findIndex((s) => s.status === order.status);
  const head = HEADLINE[order.status];
  const person = pickCourier(order.id);

  // previsão
  const [etaMin, etaMax] = isDelivery ? (order.shipping === 'expressa' ? [20, 35] : [40, 60]) : [15, 25];
  let eta = `${formatTime(addMin(order.createdAt, etaMin))} – ${formatTime(addMin(order.createdAt, etaMax))}`;
  let etaLabel = isDelivery ? 'Previsão de entrega' : 'Previsão para servir';
  if (order.status === 'entregue') {
    etaLabel = isDelivery ? 'Entregue às' : 'Servido às';
    eta = formatTime(order.updatedAt);
  } else if (order.status === 'pronto' && isDelivery && geo.route) {
    const left = Math.max(1, Math.ceil((geo.route.duration * (1 - courierFraction(courier, now))) / 60));
    etaLabel = 'Chega em';
    eta = `${left} min`;
  }

  const distanceKm = geo.route ? (geo.route.distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : null;

  return (
    <div className="min-h-screen bg-zinc-100">
      {justPlaced && <OrderPlacedSplash order={order} onDone={() => navigate('.', { replace: true, state: null })} />}
      {celebrate && <DeliveredCelebration order={order} onClose={() => setCelebrate(false)} />}

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/cardapio" className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100" aria-label="Voltar ao cardápio">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-zinc-500">Acompanhar pedido</p>
            <h1 className="truncate font-extrabold text-zinc-900">
              Pedido #{order.number} · {formatTime(order.createdAt)}
            </h1>
          </div>
          <Link to="/meus-pedidos" className="ml-auto flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100" title="Meus pedidos">
            <Receipt size={16} /> <span className="hidden sm:inline">Meus pedidos</span>
          </Link>
          <button
            onClick={() => setSimulate((s) => !s)}
            disabled={order.status === 'entregue'}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-40 ${
              simulate ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
            title="Avança as etapas sozinho, para apresentar sem abrir a tela da cozinha"
          >
            {simulate ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            {simulate ? 'Parar simulação' : <span>Simular <span className="hidden sm:inline">andamento</span></span>}
          </button>
        </div>
      </header>

      <div className={`mx-auto max-w-[1400px] ${isDelivery ? 'lg:grid lg:grid-cols-[1fr_440px] lg:gap-6 lg:px-6 lg:py-6' : 'px-4 py-6 sm:px-6'}`}>
        {/* Mapa (delivery) */}
        {isDelivery && (
          <div className="relative lg:order-none">
            {geo.customer ? (
              <DeliveryMap
                restaurant={geo.restaurant}
                customer={geo.customer}
                route={geo.route}
                courier={courier}
                className="h-[46vh] w-full lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:rounded-2xl lg:shadow-sm lg:ring-1 lg:ring-zinc-200"
              />
            ) : (
              <div className="grid h-[46vh] w-full place-items-center bg-zinc-200 text-sm font-medium text-zinc-500 lg:h-[calc(100vh-8rem)] lg:rounded-2xl">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="animate-bounce" /> Localizando seu endereço…
                </span>
              </div>
            )}
            {distanceKm && order.status !== 'entregue' && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-md lg:left-4 lg:top-4">
                {distanceKm} km até você{geo.approximate || geo.route?.approximate ? ' · aprox.' : ''}
              </span>
            )}
          </div>
        )}

        {/* Painel */}
        <div className={`relative space-y-4 ${isDelivery ? '-mt-6 rounded-t-3xl bg-zinc-100 px-4 pb-10 pt-5 sm:px-6 lg:mt-0 lg:rounded-none lg:p-0' : 'mx-auto max-w-2xl'}`}>
          {/* Status */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            {!isDelivery && <MesaHero status={order.status} />}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 key={order.status} className="track-pop text-xl font-extrabold text-zinc-900">
                  {head[kind]}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">{head.sub[kind]}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] font-medium text-zinc-500">{etaLabel}</p>
                <p className="flex items-center justify-end gap-1 text-lg font-extrabold text-zinc-900">
                  <Clock size={16} className="text-yellow-600" /> {eta}
                </p>
              </div>
            </div>

            {/* barra segmentada */}
            <div className="mt-4 grid grid-cols-4 gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span key={s.status} className="relative h-1.5 overflow-hidden rounded-full bg-zinc-200">
                  {i < stepIndex || order.status === 'entregue' ? (
                    <span className="absolute inset-0 bg-yellow-400" />
                  ) : i === stepIndex ? (
                    <span className="track-shimmer absolute inset-0 bg-yellow-400" />
                  ) : null}
                </span>
              ))}
            </div>
          </section>

          {/* Entregador */}
          {isDelivery && order.status !== 'pendente' && (
            <section className="track-pop flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-900 font-bold text-yellow-400">
                {person.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-yellow-400 text-zinc-900 ring-2 ring-white">
                  <Bike size={13} />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-bold text-zinc-900">
                  {person.name}
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-zinc-500">
                    <Star size={12} className="text-yellow-400" fill="currentColor" /> 4,9
                  </span>
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {person.bike} · {person.plate}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-yellow-700">
                  {order.status === 'preparo' && 'Aguardando no restaurante'}
                  {order.status === 'pronto' && `A caminho${distanceKm ? ` · ${distanceKm} km` : ''}`}
                  {order.status === 'entregue' && `Entregou às ${formatTime(order.updatedAt)}`}
                </p>
              </div>
              {order.status !== 'entregue' && (
                <div className="flex gap-2">
                  <a href={`tel:${order.phone}`} onClick={(e) => e.preventDefault()} className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200" title="Ligar (demonstração)" aria-label="Ligar para o entregador">
                    <Phone size={18} />
                  </a>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200" title="Chat (demonstração)" aria-label="Conversar com o entregador">
                    <MessageCircle size={18} />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Linha do tempo */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h3 className="mb-4 text-sm font-bold text-zinc-900">Andamento</h3>
            <ol>
              {STEPS.map((s, i) => {
                const done = i < stepIndex || order.status === 'entregue';
                const current = i === stepIndex && order.status !== 'entregue';
                const Icon = !isDelivery && s.status === 'pronto' ? Bell : s.icon;
                return (
                  <li key={s.status} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < STEPS.length - 1 && (
                      <span className={`absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 ${done ? 'bg-yellow-400' : 'bg-zinc-200'}`} />
                    )}
                    <span
                      className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        done ? 'bg-yellow-400 text-zinc-900' : current ? 'bg-zinc-900 text-yellow-400' : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {current && <span className="absolute inset-0 animate-ping rounded-full bg-zinc-900/30" />}
                      <Icon size={17} />
                    </span>
                    <div className="pt-1.5">
                      <p className={`text-sm font-semibold ${done || current ? 'text-zinc-900' : 'text-zinc-400'}`}>{s[kind]}</p>
                      {i === 0 && <p className="text-xs text-zinc-500">{formatTime(order.createdAt)}</p>}
                      {i > 0 && (current || (done && i === stepIndex)) && <p className="text-xs text-zinc-500">{formatTime(order.updatedAt)}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Detalhes */}
          <section className="space-y-3 rounded-2xl bg-white p-5 text-sm shadow-sm ring-1 ring-zinc-200">
            <p className="flex items-start gap-2 text-zinc-700">
              <MapPin size={16} className="mt-0.5 shrink-0 text-zinc-400" />
              <span>
                <span className="block text-xs text-zinc-500">{isDelivery ? 'Endereço de entrega' : 'Local'}</span>
                {isDelivery ? formatLocationFull(order.location) : formatLocation(order.location)}
              </span>
            </p>
            <p className="flex items-start gap-2 text-zinc-700">
              <CreditCard size={16} className="mt-0.5 shrink-0 text-zinc-400" />
              <span>
                <span className="block text-xs text-zinc-500">Pagamento · {order.payment.status === 'pago' ? 'confirmado' : 'pendente'}</span>
                {formatPayment(order.payment)}
              </span>
            </p>
            <div className="border-t border-zinc-100 pt-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <UtensilsCrossed size={14} /> Itens
              </p>
              <ul className="space-y-1">
                {order.items.map((it) => (
                  <li key={it.productId} className="flex justify-between gap-3 text-zinc-700">
                    <span>
                      <b className="text-zinc-900">{it.quantity}x</b> {it.name}
                    </span>
                    <span className="shrink-0">{formatPrice(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              {order.deliveryFee > 0 && (
                <p className="mt-2 flex justify-between text-zinc-500">
                  <span>Frete</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </p>
              )}
              {!!order.discount && (
                <p className="mt-1 flex justify-between text-green-700">
                  <span>Desconto</span>
                  <span>- {formatPrice(order.discount)}</span>
                </p>
              )}
              <p className="mt-2 flex justify-between border-t border-zinc-100 pt-2 text-base font-extrabold text-zinc-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </p>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <Link to="/meus-pedidos" className="rounded-xl bg-white py-3 text-center font-bold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50">
              Meus pedidos
            </Link>
            <Link to="/cardapio" className="rounded-xl bg-yellow-400 py-3 text-center font-bold text-zinc-900 hover:bg-yellow-500">
              Voltar ao cardápio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ilustração animada para pedidos na mesa (sem mapa). */
function MesaHero({ status }: { status: OrderStatus }) {
  const Icon = status === 'pendente' ? ClipboardCheck : status === 'preparo' ? ChefHat : status === 'pronto' ? Bell : CircleCheck;
  return (
    <div className="relative mb-5 grid h-40 place-items-center overflow-hidden rounded-xl bg-zinc-900">
      <span className="track-ring absolute h-24 w-24 rounded-full border-2 border-yellow-400/50" />
      <span className="track-ring absolute h-24 w-24 rounded-full border-2 border-yellow-400/50" style={{ animationDelay: '900ms' }} />
      <span key={status} className={`track-pop grid h-20 w-20 place-items-center rounded-2xl bg-yellow-400 text-zinc-900 ${status === 'preparo' ? 'track-wobble' : status === 'pronto' ? 'track-ring-bell' : ''}`}>
        <Icon size={40} strokeWidth={2.2} />
      </span>
      {status === 'preparo' &&
        [0, 1, 2].map((i) => (
          <span key={i} className="track-steam absolute top-6 h-6 w-1.5 rounded-full bg-white/40" style={{ left: `calc(50% + ${(i - 1) * 14}px)`, animationDelay: `${i * 300}ms` }} />
        ))}
    </div>
  );
}
