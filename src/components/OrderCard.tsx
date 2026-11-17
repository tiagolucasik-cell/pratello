import { Armchair, ArrowRight, Banknote, Bike, Check, Clock, CreditCard, MessageSquareText, Phone, QrCode, User } from 'lucide-react';
import type { Order } from '../types';
import { NEXT_ACTION_LABEL, formatPayment, formatPrice, formatTime, minutesSince } from '../utils/format';
import { Button } from './ui';

const PAYMENT_ICON = { cartao: CreditCard, pix: QrCode, dinheiro: Banknote };

interface Props {
  order: Order;
  onAdvance: () => void;
  onMarkPaid: () => void;
}

export default function OrderCard({ order, onAdvance, onMarkPaid }: Props) {
  const action = NEXT_ACTION_LABEL[order.status];
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
        </div>
      )}

      <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="text-zinc-700">
            <b className="text-zinc-900">{it.quantity}x</b> {it.name}
          </li>
        ))}
      </ul>

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
        </div>
        {action && (
          <Button size="sm" onClick={onAdvance}>
            {action} <ArrowRight size={14} />
          </Button>
        )}
      </footer>
    </article>
  );
}
