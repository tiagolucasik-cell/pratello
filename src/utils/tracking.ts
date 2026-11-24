import { useEffect, useState } from 'react';
import type { CourierState } from '../components/DeliveryMap';
import type { Order } from '../types';
import { getRestaurant, getRoute, locateCustomer, type LatLng, type Route } from './geo';

/** Tempo da animação do entregador no mapa (demo: 1 minuto; o texto mostra o tempo real da rota). */
export const RIDE_MS = 60_000;

/** Onde está o entregador de acordo com o status do pedido. */
export function courierStateFor(order: Order | undefined): CourierState {
  if (!order || order.location.mode !== 'delivery') return { mode: 'hidden' };
  if (order.status === 'entregue') return { mode: 'arrived' };
  if (order.status === 'pronto') return { mode: 'riding', start: order.updatedAt, ms: RIDE_MS };
  if (order.status === 'preparo') return { mode: 'waiting' };
  return { mode: 'hidden' };
}

export interface DeliveryGeo {
  restaurant: LatLng;
  customer: LatLng | null;
  route: Route | null;
  approximate: boolean;
}

/** Coordenadas do restaurante e do cliente e a rota entre eles, buscadas uma vez por endereço. */
export function useDeliveryGeo(order: Order | undefined): DeliveryGeo {
  const [geo, setGeo] = useState<DeliveryGeo>(() => {
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
