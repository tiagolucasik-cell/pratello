import { Armchair, Bike, CheckCircle2, ChevronDown, LogOut, Search, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Cart from '../components/Cart';
import CategoryCarousel from '../components/CategoryCarousel';
import FeaturedSection from '../components/FeaturedSection';
import LocationForm, { draftToLocation, toDraft, type LocationDraft } from '../components/LocationForm';
import Logo from '../components/Logo';
import Modal from '../components/Modal';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { CategoryId, Order, Product, TagId } from '../types';
import { discountPercent, formatLocation, formatPrice } from '../utils/format';

type Chip = 'todos' | 'populares' | CategoryId;

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Menu() {
  const { products, categories, visualCategories, session, logout, addToCart, updateLocation, cartLines, cartCount, cartTotal, orders } = useApp();
  const [chip, setChip] = useState<Chip>('todos');
  const [tag, setTag] = useState<TagId | null>(null);
  const [query, setQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<Order | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [locationDraft, setLocationDraft] = useState<LocationDraft | null>(null);
  const [locationError, setLocationError] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const client = session?.type === 'cliente' ? session : null;

  const chips: { id: Chip; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'populares', label: 'Mais Pedidos' },
    ...categories.map((c) => ({ id: c.id as Chip, label: c.name })),
  ];

  const available = useMemo(() => products.filter((p) => p.available), [products]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return available.filter((p) => {
      if (chip === 'populares' && !p.popular) return false;
      if (chip !== 'todos' && chip !== 'populares' && p.category !== chip) return false;
      if (tag === 'promocoes' ? discountPercent(p.price, p.originalPrice) === 0 && !p.tags.includes('promocoes') : tag && !p.tags.includes(tag))
        return false;
      if (!q) return true;
      return [p.name, p.description, ...p.ingredients].some((t) => normalize(t).includes(q));
    });
  }, [available, chip, tag, query]);

  const featured = useMemo(
    () =>
      available
        .filter((p) => p.popular || discountPercent(p.price, p.originalPrice) > 0)
        .sort((a, b) => Number(b.popular) - Number(a.popular)),
    [available],
  );

  const myOrders = useMemo(() => (client ? orders.filter((o) => o.clientId === client.clientId) : []), [orders, client]);

  const qtyInCart = (id: string) => cartLines.find((l) => l.product.id === id)?.quantity ?? 0;

  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const selectTag = (id: TagId | null) => {
    setTag(id);
    if (id) scrollToGrid();
  };

  const clearFilters = () => {
    setTag(null);
    setChip('todos');
    setQuery('');
  };

  const handleOrderPlaced = (order: Order) => {
    setToast(order);
    setCartOpen(false);
  };

  const openLocation = () => {
    setLocationError('');
    setLocationDraft(toDraft(client?.location));
  };

  const saveLocation = () => {
    if (!locationDraft) return;
    const loc = draftToLocation(locationDraft);
    if (typeof loc === 'string') return setLocationError(loc);
    updateLocation(loc);
    setLocationDraft(null);
  };

  const closeDetail = useCallback(() => setDetail(null), []);

  const hasFilter = tag !== null || chip !== 'todos' || query.trim() !== '';
  const tagName = visualCategories.find((c) => c.id === tag)?.name;
  const chipName = chips.find((c) => c.id === chip)?.label;
  const isDelivery = client?.location.mode === 'delivery';

  const locationButton = client && (
    <button
      onClick={openLocation}
      className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-zinc-100"
      title="Alterar local de atendimento"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-yellow-400 text-zinc-900">
        {isDelivery ? <Bike size={16} /> : <Armchair size={16} />}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[11px] text-zinc-500">{isDelivery ? 'Entregar em' : 'Salão'}</span>
        <span className="flex items-center gap-0.5 text-sm font-bold text-zinc-900">
          <span className="truncate">{formatLocation(client.location)}</span>
          <ChevronDown size={14} className="shrink-0 text-yellow-600" />
        </span>
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
          <Logo />
          <div className="hidden max-w-xs md:block">{locationButton}</div>
          <div className="order-3 w-full md:order-none md:mx-2 md:w-auto md:flex-1">
            <div className="relative mx-auto max-w-xl">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por prato ou ingrediente…"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <div className="hidden items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 lg:flex">
              <User size={16} className="text-zinc-500" />
              <p className="text-sm font-semibold text-zinc-900">{client?.name}</p>
            </div>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
          {/* Local de atendimento — sempre visível também no celular */}
          <div className="order-2 w-full md:hidden">{locationButton}</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px]">
        <main className="min-w-0 pb-24 lg:pb-0">
          {/* Banner */}
          <section className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 sm:p-8">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-yellow-400/20" />
            <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-yellow-400/10" />
            <div className="relative max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-zinc-900">
                <Sparkles size={14} /> Promoção do dia
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Combo Pratello Burger + Batata <span className="text-yellow-400">com 15% off</span>
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Olá, {client?.name.split(' ')[0]}! {isDelivery ? 'Entregamos na sua casa — frete grátis acima de R$ 100.' : 'Peça direto da mesa e acompanhe o preparo em tempo real.'}
              </p>
            </div>
          </section>

          {/* Categorias visuais */}
          <div className="mt-5">
            <CategoryCarousel items={visualCategories} active={tag} onSelect={selectTag} />
          </div>

          {/* Destaques */}
          <FeaturedSection
            products={featured}
            categories={categories}
            onOpen={setDetail}
            onSeeMore={() => {
              setTag(null);
              setChip('populares');
              scrollToGrid();
            }}
          />

          {/* Filtro por seção do cardápio */}
          <div ref={gridRef} className="scroll-mt-36 md:scroll-mt-24">
            <h2 className="mt-8 text-xl font-extrabold text-zinc-900">Cardápio</h2>
            <nav className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Seções do cardápio">
              {chips.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setChip(f.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    chip === f.id ? 'bg-yellow-400 text-zinc-900' : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </nav>

            {hasFilter && (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-zinc-200">
                <span className="text-zinc-600">
                  <b className="text-zinc-900">{visible.length}</b> {visible.length === 1 ? 'prato' : 'pratos'}
                </span>
                {tag && <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 font-semibold text-yellow-800">{tagName}</span>}
                {chip !== 'todos' && <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-semibold text-zinc-700">{chipName}</span>}
                {query.trim() && <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-semibold text-zinc-700">“{query.trim()}”</span>}
                <button onClick={clearFilters} className="ml-auto flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800">
                  <X size={14} /> Limpar filtro
                </button>
              </div>
            )}

            {visible.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
                Nenhum prato encontrado com esses filtros.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} inCart={qtyInCart(p.id)} onAdd={() => addToCart(p.id)} onOpen={() => setDetail(p)} />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Carrinho fixo (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <Cart onOrderPlaced={handleOrderPlaced} onChangeLocation={openLocation} myOrders={myOrders} />
          </div>
        </aside>
      </div>

      {/* Barra do carrinho (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white p-3 lg:hidden">
        <button
          onClick={() => setCartOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-zinc-900 hover:bg-yellow-500"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={18} /> Ver pedido
            {cartCount > 0 && <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white">{cartCount}</span>}
          </span>
          <span>{formatPrice(cartTotal)}</span>
        </button>
      </div>

      {/* Drawer (mobile) */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0 bg-zinc-900/60" />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Cart onClose={() => setCartOpen(false)} onOrderPlaced={handleOrderPlaced} onChangeLocation={openLocation} myOrders={myOrders} />
          </div>
        </div>
      )}

      <ProductModal
        product={detail}
        onClose={closeDetail}
        onAdd={(p, qty) => {
          addToCart(p.id, qty);
          setDetail(null);
        }}
      />

      <Modal open={!!locationDraft} title="Onde você está?" onClose={() => setLocationDraft(null)}>
        {locationDraft && (
          <div className="space-y-4">
            <LocationForm
              value={locationDraft}
              onChange={(d) => {
                setLocationDraft(d);
                setLocationError('');
              }}
            />
            {locationError && <p className="text-sm font-medium text-red-600">{locationError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLocationDraft(null)}>
                Cancelar
              </Button>
              <Button onClick={saveLocation}>Confirmar local</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast de confirmação */}
      {toast && (
        <div className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-zinc-900 p-4 text-white shadow-xl lg:bottom-6">
          <CheckCircle2 className="shrink-0 text-yellow-400" />
          <div className="text-sm">
            <p className="font-bold">Pedido #{toast.number} enviado!</p>
            <p className="text-zinc-300">
              {formatPrice(toast.total)} · {toast.payment.status === 'pago' ? 'pagamento confirmado' : 'pagamento pendente'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
