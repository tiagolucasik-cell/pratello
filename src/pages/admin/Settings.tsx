import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, Flame, Loader2, MapPin, Palette, Plus, RotateCcw, Search, Star, Store } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../../components/ui';
import { DEFAULT_RESTAURANT, TILE_OPTIONS, TILE_URL, geocode, getRestaurant, setRestaurant, type RestaurantPlace } from '../../utils/geo';
import { ACCENTS, DEFAULT_ACCENT, getAccent, setAccent, type AccentId } from '../../utils/theme';

export default function Settings() {
  const [current, setCurrent] = useState<AccentId>(getAccent);

  const choose = (id: AccentId) => {
    setAccent(id);
    setCurrent(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Configurações</h1>
      <p className="text-sm text-zinc-600">Personalize a aparência e o endereço do Pratello.</p>

      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-zinc-900">
              <Palette size={18} /> Cor de destaque
            </h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-600">
              Usada em botões, abas, selos, carrosséis e no carrinho. Muda na hora em todas as telas abertas neste navegador:
              cardápio, cozinha e admin.
            </p>
          </div>
          {current !== DEFAULT_ACCENT && (
            <Button variant="outline" size="sm" onClick={() => choose(DEFAULT_ACCENT)}>
              <RotateCcw size={14} /> Restaurar padrão
            </Button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7" role="radiogroup" aria-label="Cor de destaque">
          {ACCENTS.map((a) => {
            const active = current === a.id;
            return (
              <button
                key={a.id}
                role="radio"
                aria-checked={active}
                onClick={() => choose(a.id)}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${active ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}
              >
                <div className="flex h-10 overflow-hidden rounded-lg">
                  {([200, 400, 600] as const).map((s) => (
                    <span key={s} className="flex-1" style={{ backgroundColor: a.shades[s] }} />
                  ))}
                </div>
                <span className="mt-2 flex items-center justify-between text-sm font-semibold text-zinc-900">
                  {a.name}
                  {active && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-zinc-900 text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prévia com os componentes reais */}
        <div className="mt-6 rounded-xl bg-zinc-100 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Prévia</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Finalizar Pedido</Button>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-zinc-900">
              <Plus size={20} strokeWidth={2.5} />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-zinc-900">
              <Flame size={12} /> Mais pedido
            </span>
            <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900">Lanches</span>
            <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600">Bebidas</span>
            <span className="flex gap-0.5 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </span>
            <span className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-bold text-white">
              Combo <span className="text-yellow-400">com 15% off</span>
            </span>
          </div>
        </div>
      </section>
      <RestaurantLocation />
    </div>
  );
}

/** Endereço do restaurante: ponto de partida do entregador no mapa de rastreio. */
function RestaurantLocation() {
  const [saved, setSaved] = useState<RestaurantPlace>(getRestaurant);
  const [draft, setDraft] = useState<RestaurantPlace>(saved);
  const [query, setQuery] = useState(saved.address);
  const [status, setStatus] = useState<'idle' | 'loading' | 'notfound' | 'error' | 'saved'>('idle');
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, { scrollWheelZoom: false }).setView([saved.lat, saved.lng], 16);
    L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(m);
    const svg = renderToStaticMarkup(<Store size={20} strokeWidth={2.4} />);
    marker.current = L.marker([saved.lat, saved.lng], {
      draggable: true,
      icon: L.divIcon({ html: `<div class="map-pin map-pin-dark"><span>${svg}</span></div>`, className: 'pratello-marker', iconSize: [44, 44], iconAnchor: [22, 44] }),
    }).addTo(m);
    const move = (lat: number, lng: number) => {
      marker.current?.setLatLng([lat, lng]);
      setDraft((d) => ({ ...d, lat, lng }));
      setStatus('idle');
    };
    marker.current.on('dragend', () => {
      const p = marker.current!.getLatLng();
      move(p.lat, p.lng);
    });
    m.on('click', (e: L.LeafletMouseEvent) => move(e.latlng.lat, e.latlng.lng));
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (p: RestaurantPlace) => {
    setDraft(p);
    marker.current?.setLatLng([p.lat, p.lng]);
    map.current?.setView([p.lat, p.lng], 16);
  };

  const search = async () => {
    if (!query.trim()) return;
    setStatus('loading');
    try {
      const found = await geocode(query.trim());
      if (!found) return setStatus('notfound');
      goTo({ address: query.trim(), lat: found.point[0], lng: found.point[1] });
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const save = () => {
    const place = { ...draft, address: query.trim() || draft.address };
    setRestaurant(place);
    setSaved(place);
    setStatus('saved');
  };

  const changed = draft.lat !== saved.lat || draft.lng !== saved.lng || query.trim() !== saved.address;

  return (
    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-zinc-900">
            <MapPin size={18} /> Endereço do restaurante
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-600">
            Ponto de partida do entregador no mapa de rastreio. Busque o endereço e, se precisar, arraste o pin ou clique no mapa
            para ajustar.
          </p>
        </div>
        {(saved.lat !== DEFAULT_RESTAURANT.lat || saved.lng !== DEFAULT_RESTAURANT.lng) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              goTo(DEFAULT_RESTAURANT);
              setQuery(DEFAULT_RESTAURANT.address);
            }}
          >
            <RotateCcw size={14} /> Restaurar padrão
          </Button>
        )}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setStatus('idle');
          }}
          placeholder="Rua, número, bairro, cidade"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
        />
        <Button type="submit" variant="outline" disabled={status === 'loading'}>
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Buscar
        </Button>
      </form>
      {status === 'notfound' && <p className="mt-2 text-sm font-medium text-red-600">Endereço não encontrado. Tente incluir a cidade.</p>}
      {status === 'error' && <p className="mt-2 text-sm font-medium text-red-600">Sem conexão com o serviço de mapas. Ajuste o pin manualmente.</p>}

      <div ref={box} className="isolate z-0 mt-4 h-72 overflow-hidden rounded-xl bg-zinc-200 ring-1 ring-zinc-200" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">
          {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
        </p>
        <div className="flex items-center gap-3">
          {status === 'saved' && !changed && (
            <span className="flex items-center gap-1 text-sm font-semibold text-green-700">
              <Check size={16} /> Salvo
            </span>
          )}
          <Button onClick={save} disabled={!changed}>
            Salvar endereço
          </Button>
        </div>
      </div>
    </section>
  );
}
