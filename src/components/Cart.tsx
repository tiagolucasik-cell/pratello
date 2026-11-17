import { Armchair, Bike, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FREE_DELIVERY_FROM } from '../data/mockData';
import type { Order } from '../types';
import { formatLocation, formatPrice, formatTime } from '../utils/format';
import PaymentSelector, { draftToPayment, emptyPayment, type PaymentDraft } from './PaymentSelector';
import ProductImage from './ProductImage';
import { Button, StatusBadge, Textarea } from './ui';

interface CartProps {
  onClose?: () => void;
  onOrderPlaced: (order: Order) => void;
  onChangeLocation: () => void;
  myOrders: Order[];
}

export default function Cart({ onClose, onOrderPlaced, onChangeLocation, myOrders }: CartProps) {
  const { cartLines, subtotal, deliveryFee, cartTotal, changeQuantity, removeFromCart, placeOrder, session } = useApp();
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState<PaymentDraft>(emptyPayment);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const location = session?.type === 'cliente' ? session.location : null;
  const isDelivery = location?.mode === 'delivery';

  const finish = async () => {
    const parsed = draftToPayment(payment, cartTotal);
    if (typeof parsed === 'string') return setError(parsed);
    setSending(true);
    const order = await placeOrder(notes, parsed);
    setSending(false);
    if (typeof order === 'string') return setError(order);
    setNotes('');
    setPayment(emptyPayment);
    setError('');
    onOrderPlaced(order);
  };

  const activeOrders = myOrders.filter((o) => o.status !== 'entregue').slice(-3).reverse();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <ShoppingBag size={20} /> Seu Pedido
        </h2>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Fechar carrinho">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {location && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-yellow-400 text-zinc-900">
              {isDelivery ? <Bike size={18} /> : <Armchair size={18} />}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-xs text-zinc-500">{isDelivery ? 'Entregar em' : 'Atendimento no salão'}</p>
              <p className="truncate font-semibold text-zinc-900">{formatLocation(location)}</p>
            </div>
            <button onClick={onChangeLocation} className="text-xs font-bold text-yellow-600 hover:text-yellow-700">
              Alterar
            </button>
          </div>
        )}

        {cartLines.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center text-zinc-500">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-zinc-100">
              <ShoppingBag size={24} />
            </div>
            <p className="font-medium text-zinc-700">Seu carrinho está vazio</p>
            <p className="text-sm">Toque no botão + para adicionar itens.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {cartLines.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-3">
                <ProductImage src={product.image} alt={product.name} className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-900">{product.name}</p>
                    <button onClick={() => removeFromCart(product.id)} className="text-zinc-400 hover:text-red-500" aria-label={`Remover ${product.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-zinc-200">
                      <button onClick={() => changeQuantity(product.id, -1)} className="p-1.5 text-zinc-600 hover:bg-zinc-100" aria-label="Diminuir">
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
                      <button onClick={() => changeQuantity(product.id, 1)} className="p-1.5 text-zinc-600 hover:bg-zinc-100" aria-label="Aumentar">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-zinc-900">{formatPrice(product.price * quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cartLines.length > 0 && (
          <>
            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm font-semibold text-zinc-800">Observações</span>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: sem cebola, ponto da carne…" />
            </label>
            <div className="mt-5">
              <PaymentSelector
                value={payment}
                onChange={(d) => {
                  setPayment(d);
                  setError('');
                }}
                total={cartTotal}
                isDelivery={isDelivery}
              />
            </div>
          </>
        )}

        {activeOrders.length > 0 && (
          <div className="mt-6 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Acompanhe seus pedidos</p>
            <ul className="space-y-2">
              {activeOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700">
                    <b>#{o.number}</b> · {formatTime(o.createdAt)}
                  </span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-200 px-5 py-4">
        <div className="flex justify-between text-sm text-zinc-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {isDelivery && (
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Taxa de entrega</span>
            <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : <b className="text-green-600">Grátis</b>}</span>
          </div>
        )}
        {isDelivery && deliveryFee > 0 && (
          <p className="text-xs text-zinc-500">Frete grátis em pedidos a partir de {formatPrice(FREE_DELIVERY_FROM)}.</p>
        )}
        <div className="flex justify-between pt-1 text-lg font-extrabold text-zinc-900">
          <span>Total</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <Button size="lg" className="w-full justify-between" disabled={cartLines.length === 0 || sending} onClick={finish}>
          <span>{sending ? 'Enviando…' : 'Finalizar Pedido'}</span>
          <span>{formatPrice(cartTotal)}</span>
        </Button>
      </div>
    </div>
  );
}
