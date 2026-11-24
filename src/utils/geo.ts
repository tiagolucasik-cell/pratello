/**
 * Geolocalização para o rastreio de entregas.
 * - Endereço do restaurante: configurável em Admin → Configurações (salvo no navegador).
 * - Endereço do cliente: CEP → ViaCEP (cidade) → OpenStreetMap/Nominatim (coordenadas).
 * - Rota pelas ruas: OSRM. Sem internet (ou endereço muito longe), usa uma rota aproximada.
 * Tudo que vem da internet fica em cache no navegador para não repetir buscas.
 */
import type { Address } from '../types';

export type LatLng = [number, number];

/** Mapa base do OpenStreetMap (gratuito, sem chave de API). */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_OPTIONS = {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

export interface RestaurantPlace {
  address: string;
  lat: number;
  lng: number;
}

export interface Route {
  points: LatLng[];
  /** metros */
  distance: number;
  /** segundos (tempo real estimado de moto/carro) */
  duration: number;
  /** true quando a rota é aproximada (sem a rota real pelas ruas) */
  approximate: boolean;
}

export const DEFAULT_RESTAURANT: RestaurantPlace = {
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  lat: -23.5651,
  lng: -46.6519,
};

const RESTAURANT_KEY = 'pratello:restaurant';
const CACHE_KEY = 'pratello:geocache';
/** Clientes mais longe que isso do restaurante são reposicionados perto dele (demo). */
const MAX_DELIVERY_KM = 25;

/* ---------- Restaurante ---------- */

export function getRestaurant(): RestaurantPlace {
  try {
    const raw = localStorage.getItem(RESTAURANT_KEY);
    if (raw) {
      const p = JSON.parse(raw) as RestaurantPlace;
      if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) return p;
    }
  } catch {
    /* usa o padrão */
  }
  return DEFAULT_RESTAURANT;
}

export function setRestaurant(place: RestaurantPlace) {
  try {
    localStorage.setItem(RESTAURANT_KEY, JSON.stringify(place));
  } catch {
    /* armazenamento indisponível */
  }
}

export const isRestaurantKey = (key: string | null) => key === RESTAURANT_KEY;

/* ---------- Cache ---------- */

function cacheGet<T>(key: string): T | undefined {
  try {
    return (JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, T>)[key];
  } catch {
    return undefined;
  }
}

function cacheSet(key: string, value: unknown) {
  try {
    const all = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as Record<string, unknown>;
    const keys = Object.keys(all);
    if (keys.length > 60) delete all[keys[0]];
    all[key] = value;
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    /* sem cache */
  }
}

/* ---------- Geometria ---------- */

const toRad = (d: number) => (d * Math.PI) / 180;

/** Distância em metros entre dois pontos. */
export function distanceM(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Ponto a uma fração (0..1) do caminho, medida pela distância percorrida. */
export function pointAlong(points: LatLng[], fraction: number): { point: LatLng; index: number } {
  if (points.length < 2) return { point: points[0], index: 0 };
  const f = Math.min(1, Math.max(0, fraction));
  const seg = points.slice(1).map((p, i) => distanceM(points[i], p));
  let target = seg.reduce((s, d) => s + d, 0) * f;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? Math.min(1, target / seg[i]) : 1;
      const [a, b] = [points[i], points[i + 1]];
      return { point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], index: i };
    }
    target -= seg[i];
  }
  return { point: points[points.length - 1], index: points.length - 2 };
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Posição de demonstração perto do restaurante, sempre a mesma para o mesmo endereço. */
function nearbyPoint(origin: LatLng, seed: string): LatLng {
  const h = hash(seed);
  const angle = ((h % 360) * Math.PI) / 180;
  const km = 1.2 + ((h >> 9) % 20) / 10; // 1,2 a 3,1 km
  const dLat = (km / 111) * Math.cos(angle);
  const dLng = (km / (111 * Math.cos(toRad(origin[0])))) * Math.sin(angle);
  return [origin[0] + dLat, origin[1] + dLng];
}

/* ---------- Busca de endereços ---------- */

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Endereço em texto → coordenadas (OpenStreetMap). */
export async function geocode(query: string, signal?: AbortSignal): Promise<{ point: LatLng; label: string } | null> {
  const key = `q:${query.toLowerCase()}`;
  const cached = cacheGet<{ point: LatLng; label: string } | null>(key);
  if (cached !== undefined) return cached;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(query)}`;
  const data = await getJson<{ lat: string; lon: string; display_name: string }[]>(url, signal);
  const result = data[0] ? { point: [Number(data[0].lat), Number(data[0].lon)] as LatLng, label: data[0].display_name } : null;
  cacheSet(key, result);
  return result;
}

/** Endereço do cliente → coordenadas. Se não achar (ou ficar longe demais), usa um ponto perto do restaurante. */
export async function locateCustomer(address: Address, restaurant: LatLng, signal?: AbortSignal): Promise<{ point: LatLng; approximate: boolean }> {
  const seed = `${address.cep}|${address.street}|${address.number}`;
  try {
    const cep = address.cep.replace(/\D/g, '');
    let city = '';
    if (cep.length === 8) {
      const via = cacheGet<{ localidade?: string; uf?: string }>(`cep:${cep}`) ?? (await getJson<{ localidade?: string; uf?: string }>(`https://viacep.com.br/ws/${cep}/json/`, signal));
      cacheSet(`cep:${cep}`, via);
      if (via.localidade) city = `${via.localidade} - ${via.uf}`;
    }
    const tries = [
      [address.street && `${address.street}, ${address.number}`, address.district, city].filter(Boolean).join(', '),
      [address.street, city].filter(Boolean).join(', '),
    ];
    for (const q of tries) {
      if (!q) continue;
      const found = await geocode(q, signal);
      if (found && distanceM(found.point, restaurant) / 1000 <= MAX_DELIVERY_KM) return { point: found.point, approximate: false };
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
  }
  return { point: nearbyPoint(restaurant, seed), approximate: true };
}

/** Rota aproximada: uma curva suave entre os dois pontos. */
function fallbackRoute(from: LatLng, to: LatLng): Route {
  const steps = 24;
  const mid: LatLng = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const bend: LatLng = [mid[0] + (to[1] - from[1]) * 0.18, mid[1] - (to[0] - from[0]) * 0.18];
  const points = Array.from({ length: steps + 1 }, (_, i): LatLng => {
    const t = i / steps;
    const u = 1 - t;
    return [u * u * from[0] + 2 * u * t * bend[0] + t * t * to[0], u * u * from[1] + 2 * u * t * bend[1] + t * t * to[1]];
  });
  const distance = points.slice(1).reduce((s, p, i) => s + distanceM(points[i], p), 0);
  return { points, distance, duration: (distance / 1000 / 22) * 3600, approximate: true }; // ~22 km/h no trânsito
}

/** Rota pelas ruas (OSRM). */
export async function getRoute(from: LatLng, to: LatLng, signal?: AbortSignal): Promise<Route> {
  const r = (n: number) => n.toFixed(5);
  const key = `r:${r(from[0])},${r(from[1])};${r(to[0])},${r(to[1])}`;
  const cached = cacheGet<Route>(key);
  if (cached) return cached;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${r(from[1])},${r(from[0])};${r(to[1])},${r(to[0])}?overview=full&geometries=geojson`;
    const data = await getJson<{ routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] }>(url, signal);
    const best = data.routes?.[0];
    if (!best) throw new Error('sem rota');
    const route: Route = {
      points: best.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance: best.distance,
      duration: best.duration,
      approximate: false,
    };
    cacheSet(key, route);
    return route;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    return fallbackRoute(from, to);
  }
}
