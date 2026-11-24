import { Clock, MapPin, Route as RouteIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Order } from '../types';
import { formatLocationFull, trackingLabel } from '../utils/format';
import { courierStateFor, useDeliveryGeo } from '../utils/tracking';
import DeliveryMap, { courierFraction } from './DeliveryMap';
import Modal from './Modal';

/** Mapa da entrega para a equipe: mesmo trajeto e entregador que o cliente vê. */
export default function DeliveryMapModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const geo = useDeliveryGeo(order);
  const courier = useMemo(() => courierStateFor(order), [order]);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const km = geo.route ? (geo.route.distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : null;
  const minutes = geo.route ? Math.max(1, Math.ceil((geo.route.duration * (1 - courierFraction(courier, now))) / 60)) : null;

  return (
    <Modal open title={`Entrega do pedido #${order.number}`} onClose={onClose}>
      <div className="-mx-5 -mt-5">
        {geo.customer ? (
          <DeliveryMap restaurant={geo.restaurant} customer={geo.customer} route={geo.route} courier={courier} className="h-72 w-full sm:h-80" />
        ) : (
          <div className="grid h-72 place-items-center bg-zinc-200 text-sm text-zinc-500 sm:h-80">Localizando endereço…</div>
        )}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <p className="flex items-center gap-2 font-bold text-zinc-900">
          <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs">{trackingLabel(order)}</span>
          {order.customerName}
        </p>
        <p className="flex items-start gap-2 text-zinc-700">
          <MapPin size={16} className="mt-0.5 shrink-0 text-zinc-400" /> {formatLocationFull(order.location)}
        </p>
        {km && (
          <p className="flex items-center gap-4 text-zinc-700">
            <span className="flex items-center gap-1.5">
              <RouteIcon size={16} className="text-zinc-400" /> {km} km{geo.approximate || geo.route?.approximate ? ' (aprox.)' : ''}
            </span>
            {order.status !== 'entregue' && (
              <span className="flex items-center gap-1.5">
                <Clock size={16} className="text-zinc-400" /> {order.status === 'pronto' ? `chega em ~${minutes} min` : `~${minutes} min de moto`}
              </span>
            )}
          </p>
        )}
      </div>
    </Modal>
  );
}
