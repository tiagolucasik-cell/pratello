import { Armchair, ArrowRight, Banknote, Bike, Check, Clock, CreditCard, KeyRound, Map, MessageCircle, MessageSquareText, Phone, QrCode, Star, Ticket, User, Zap } from 'lucide-react';
import { useState } from 'react';
import type { Order } from '../types';
import { NEXT_ACTION_LABEL, formatPayment, formatPrice, formatTime, minutesSince } from '../utils/format';
import { DeliveryCodeModal } from './DeliveryCode';
import DeliveryMapModal from './DeliveryMapModal';
import { Button } from './ui';

const PAYMENT_ICON = { cartao: CreditCard, pix: QrCode, dinheiro: Banknote };

interface Props {
  order: Order;
  onAdvance: () => void;
  onMarkPaid: () => void;
  /** Conclui a entrega conferindo o código; devolve false se o código estiver errado. */
  onDeliver: (code: string) => boolean;
}

export default function OrderCard({ order, onAdvance, onMarkPaid, onDeliver }: Props) {
  const [showMap, setShowMap] = useState(false);
  const [askCode, setAskCode] = useState(false);
  const needsCode = order.status === 'pronto' && !!order.deliveryCode;
  const isDelivery = order.location.mode === 'delivery';
  // na entrega, "pronto" significa que o entregador saiu com o pedido
  const action = isDelivery && order.status === 'preparo' ? 'Saiu para entrega' : NEXT_ACTION_LABEL[order.status];
  const waiting = minutesSince(order.createdAt);
  const late = order.status !== 'entregue' && waiting >= 20;
  const loc = order.location;
  const PayIcon = PAYMENT_ICON[order.payment.method];
  const paid = order.payment.status === 'pago';

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-zinc-900">#{order.number}</p>
          <p className="flex items-center gap-1 truncate text-sm text-zinc-600">
            <User size={14} className="shrink-0" /> {order.customerName}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
            late ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'
          }`}
          title={`Pedido feito às ${formatTime(order.createdAt)}`}
        >
          <Clock size={12} /> {formatTime(order.createdAt)}
          {order.status !== 'entregue' && <span>· {waiting} min</span>}
        </span>
      </header>

      {/* Localização */}
      {loc.mode === 'mesa' ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-white">
          <Armchair size={16} className="text-yellow-400" />
          <span className="text-sm font-bold">Mesa {loc.table}</span>
          <span className="ml-auto text-xs text-zinc-400">Salão</span>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm ring-1 ring-yellow-200">
          <p className="flex items-center gap-1.5 font-bold text-zinc-900">
            <Bike size={16} /> Delivery
            {order.shipping === 'expressa' && (
              <span className="inline-flex items-center gap-0.5 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-yellow-400">
                <Zap size={10} /> Expressa
              </span>
            )}
            {order.channel === 'whatsapp' && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
                <MessageCircle size={11} /> WhatsApp
              </span>
            )}
          </p>
          <p className="mt-0.5 text-zinc-800">
            {loc.address.street}, {loc.address.number}
            {loc.address.complement && ` - ${loc.address.complement}`}
          </p>
          <p className="text-xs text-zinc-600">
            {loc.address.district} · CEP {loc.address.cep}
          </p>
          {order.phone && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-600">
              <Phone size={12} /> {order.phone}
            </p>
          )}
          <button
            onClick={() => setShowMap(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-xs font-bold text-zinc-800 ring-1 ring-yellow-300 hover:bg-yellow-100"
          >
            <Map size={14} /> {order.status === 'pronto' ? 'Acompanhar entregador' : 'Ver no mapa'}
          </button>
        </div>
      )}

      <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-sm">
        {order.items.map((it) => (
          <li key={it.productId} className="text-zinc-700">
            <b className="text-zinc-900">{it.quantity}x</b> {it.name}
          </li>
        ))}
      </ul>

      {order.rating && (
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-zinc-600" aria-label={`Cliente avaliou com ${order.rating} estrelas`}>
          Avaliação:
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={12} className={n <= order.rating! ? 'text-yellow-400' : 'text-zinc-300'} fill="currentColor" />
          ))}
        </p>
      )}

      {order.notes && (
        <p className="mt-3 flex gap-1.5 rounded-lg bg-yellow-50 p-2 text-sm text-yellow-900 ring-1 ring-yellow-200">
          <MessageSquareText size={16} className="mt-0.5 shrink-0" /> {order.notes}
        </p>
      )}

      {/* Pagamento */}
      <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-sm">
        <PayIcon size={16} className="shrink-0 text-zinc-500" />
        <span className="min-w-0 flex-1 text-zinc-700">{formatPayment(order.payment)}</span>
        {paid ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            <Check size={12} /> Pago
          </span>
        ) : (
          <button
            onClick={onMarkPaid}
            title="Confirmar recebimento do pagamento"
            className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-300 hover:bg-yellow-100 hover:ring-yellow-400"
          >
            A receber · confirmar
          </button>
        )}
      </div>

      <footer className="mt-3 flex items-center justify-between gap-2">
        <div className="leading-tight">
          <span className="text-sm font-bold text-zinc-900">{formatPrice(order.total)}</span>
          {order.deliveryFee > 0 && <p className="text-[11px] text-zinc-500">inclui entrega {formatPrice(order.deliveryFee)}</p>}
          {order.coupons && order.coupons.length > 0 && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-green-700" title={order.coupons.join(', ')}>
              <Ticket size={11} /> {order.coupons.join(' + ')}
              {order.discount ? ` · -${formatPrice(order.discount)}` : ''}
            </p>
          )}
        </div>
        {action && (
          <Button size="sm" onClick={needsCode ? () => setAskCode(true) : onAdvance}>
            {needsCode && <KeyRound size={14} />}
            {action} {!needsCode && <ArrowRight size={14} />}
          </Button>
        )}
      </footer>
      {askCode && <DeliveryCodeModal orderNumber={order.number} customerName={order.customerName} onConfirm={onDeliver} onClose={() => setAskCode(false)} />}
      {showMap && <DeliveryMapModal order={order} onClose={() => setShowMap(false)} />}
    </article>
  );
}
