import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bike, House, Utensils } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { pointAlong, TILE_OPTIONS, TILE_URL, type LatLng, type Route } from '../utils/geo';

/** Onde está o entregador: esperando no restaurante, a caminho, ou já entregou. */
export type CourierState =
  | { mode: 'hidden' }
  | { mode: 'waiting' }
  | { mode: 'riding'; start: number; ms: number }
  | { mode: 'arrived' };

interface Props {
  restaurant: LatLng;
  customer: LatLng;
  route: Route | null;
  courier: CourierState;
  className?: string;
}

/** Durante o trajeto o entregador para um pouco antes da porta até a cozinha marcar como entregue. */
const MAX_RIDE_FRACTION = 0.96;

const icon = (html: string, size: number, anchorY = size / 2) =>
  L.divIcon({ html, className: 'pratello-marker', iconSize: [size, size], iconAnchor: [size / 2, anchorY] });

const pin = (svg: string, tone: 'dark' | 'accent') =>
  icon(`<div class="map-pin map-pin-${tone}"><span>${svg}</span></div>`, 44, 44);

const svgOf = (el: JSX.Element) => renderToStaticMarkup(el);

/** Fração do trajeto já percorrida pelo entregador agora. */
export function courierFraction(c: CourierState, now = Date.now()): number {
  if (c.mode === 'arrived') return 1;
  if (c.mode !== 'riding') return 0;
  return Math.min(MAX_RIDE_FRACTION, Math.max(0, (now - c.start) / c.ms));
}

/**
 * Mapa de rastreio estilo app de delivery (OpenStreetMap + Leaflet):
 * pin do restaurante, pin da casa, rota pelas ruas e o entregador andando pela rota.
 */
export default function DeliveryMap({ restaurant, customer, route, courier, className = '' }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<{ done: L.Polyline; todo: L.Polyline; courier: L.Marker; pins: L.Marker[] } | null>(null);
  const courierRef = useRef(courier);
  courierRef.current = courier;

  // cria o mapa uma vez
  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: true });
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(m);
    const done = L.polyline([], { className: 'route-done', weight: 5, interactive: false }).addTo(m);
    const todo = L.polyline([], { className: 'route-todo', weight: 6, interactive: false }).addTo(m);
    const courierMarker = L.marker(restaurant, {
      icon: icon(`<div class="map-courier"><span class="map-courier-pulse"></span><span class="map-courier-dot">${svgOf(<Bike size={20} strokeWidth={2.4} />)}</span></div>`, 48),
      zIndexOffset: 1000,
      keyboard: false,
    });
    layers.current = { done, todo, courier: courierMarker, pins: [] };
    map.current = m;

    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(box.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
      layers.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pins e enquadramento
  useEffect(() => {
    const m = map.current;
    const l = layers.current;
    if (!m || !l) return;
    l.pins.forEach((p) => p.remove());
    l.pins = [
      L.marker(restaurant, { icon: pin(svgOf(<Utensils size={20} strokeWidth={2.4} />), 'dark'), title: 'Restaurante', keyboard: false }).addTo(m),
      L.marker(customer, { icon: pin(svgOf(<House size={20} strokeWidth={2.4} />), 'accent'), title: 'Seu endereço', keyboard: false }).addTo(m),
    ];
    const points = route?.points ?? [restaurant, customer];
    m.fitBounds(L.latLngBounds(points), { paddingTopLeft: [48, 72], paddingBottomRight: [48, 64], maxZoom: 16 });
  }, [restaurant, customer, route]);

  // anima o entregador e a rota restante
  useEffect(() => {
    const m = map.current;
    const l = layers.current;
    if (!m || !l) return;
    const points = route?.points ?? [restaurant, customer];
    let frame = 0;
    const draw = () => {
      const c = courierRef.current;
      const f = courierFraction(c);
      const { point, index } = pointAlong(points, f);
      l.done.setLatLngs([...points.slice(0, index + 1), point]);
      l.todo.setLatLngs(c.mode === 'arrived' ? [] : [point, ...points.slice(index + 1)]);
      if (c.mode === 'hidden') l.courier.remove();
      else {
        l.courier.setLatLng(point);
        if (!m.hasLayer(l.courier)) l.courier.addTo(m);
      }
      if (c.mode === 'riding') frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [route, courier, restaurant, customer]);

  return <div ref={box} className={`isolate z-0 bg-zinc-200 ${className}`} role="img" aria-label="Mapa com o trajeto da entrega" />;
}
