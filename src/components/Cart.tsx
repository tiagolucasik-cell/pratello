import { Armchair, Bike, ChevronRight, MapPin, Minus, Plus, ShoppingBag, Ticket, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Order } from '../types';
import { formatLocation, formatPrice, formatTime } from '../utils/format';
import ProductImage from './ProductImage';
import { Button, StatusBadge } from './ui';

interface CartProps {
  onClose?: () => void;
  onChangeLocation: () => void;
  myOrders: Order[];
}

export default function Cart({ onClose, onChangeLocation, myOrders }: CartProps) {
  const { cartLines, subtotal, changeQuantity, removeFromCart, session } = useApp();
  const navigate = useNavigate();

  const location = session?.type === 'cliente' ? session.location : null;
  const isDelivery = location?.mode === 'delivery';

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

        {activeOrders.length > 0 && (
          <div className="mt-6 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Acompanhe seus pedidos</p>
            <ul className="space-y-2">
              {activeOrders.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => navigate(`/pedido/${o.id}`)}
                    className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white"
                  >
                    <span className="flex items-center gap-1.5 text-zinc-700">
                      {o.location.mode === 'delivery' ? <MapPin size={14} className="text-yellow-600" /> : <Armchair size={14} className="text-yellow-600" />}
                      <b>#{o.number}</b> · {formatTime(o.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <StatusBadge status={o.status} />
                      <ChevronRight size={16} className="text-zinc-400" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-zinc-200 px-5 py-4">
        {cartLines.length > 0 && (
          <p className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-900 ring-1 ring-yellow-200">
            <Ticket size={14} className="shrink-0" /> Cupons, frete e pagamento na próxima etapa
          </p>
        )}
        <div className="flex justify-between text-lg font-extrabold text-zinc-900">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <Button size="lg" className="w-full justify-between" disabled={cartLines.length === 0} onClick={() => navigate('/checkout')}>
          <span>Ir para o pagamento</span>
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
