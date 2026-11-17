# Pratello — Código completo do front-end

React + Vite + TypeScript + Tailwind CSS v4 + Lucide React.

Para rodar: crie os arquivos abaixo com a mesma estrutura de pastas, depois `npm install` e `npm run dev`.

## Arquivos

- `index.html`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `public/favicon.svg`
- `src/App.tsx`
- `src/index.css`
- `src/main.tsx`
- `src/types.ts`
- `src/vite-env.d.ts`
- `src/components/Cart.tsx`
- `src/components/CategoryCarousel.tsx`
- `src/components/FeaturedSection.tsx`
- `src/components/HorizontalScroller.tsx`
- `src/components/LocationForm.tsx`
- `src/components/Logo.tsx`
- `src/components/Modal.tsx`
- `src/components/OrderCard.tsx`
- `src/components/PaymentSelector.tsx`
- `src/components/ProductCard.tsx`
- `src/components/ProductImage.tsx`
- `src/components/ProductModal.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/ui.tsx`
- `src/context/AppContext.tsx`
- `src/data/mockData.ts`
- `src/pages/Admin.tsx`
- `src/pages/Login.tsx`
- `src/pages/Menu.tsx`
- `src/pages/Orders.tsx`
- `src/utils/format.ts`
- `src/utils/routes.ts`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/MenuManager.tsx`
- `src/pages/admin/StaffManager.tsx`


## `index.html`

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pratello · Cardápio Digital</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```


## `package.json`

```json
{
  "name": "pratello",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.460.0",
    "qrcode.react": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.6.3",
    "vite": "^6.0.0"
  }
}
```


## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```


## `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```


## `public/favicon.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#FACC15"/><path d="M11 7v7a3 3 0 0 0 3 3v8M14 7v6M17 7v7a3 3 0 0 1-3 3M21 7v18M21 7c2 1 3 4 3 7h-3" stroke="#18181B" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```


## `src/App.tsx`

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useApp } from './context/AppContext';
import Admin from './pages/Admin';
import Dashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import StaffManager from './pages/admin/StaffManager';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import { homeFor } from './utils/routes';

export default function App() {
  const { session } = useApp();

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to={homeFor(session)} replace /> : <Login />} />
      <Route
        path="/cardapio"
        element={
          <ProtectedRoute allow={['cliente']}>
            <Menu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedidos"
        element={
          <ProtectedRoute allow={['funcionario', 'admin']}>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={['admin']}>
            <Admin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cardapio" element={<MenuManager />} />
        <Route path="funcionarios" element={<StaffManager />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```


## `src/index.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

html,
body {
  background-color: #f4f4f5;
  color: #18181b;
}

.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```


## `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
```


## `src/types.ts`

```ts
export type CategoryId = 'lanches' | 'pratos' | 'bebidas' | 'sobremesas';

export interface Category {
  id: CategoryId;
  name: string;
}

/** Categorias de vitrine (carrossel estilo marketplace). Um prato pode ter várias. */
export type TagId =
  | 'promocoes'
  | 'saudavel'
  | 'arabe'
  | 'acai'
  | 'doces'
  | 'chinesa'
  | 'pizza'
  | 'lanches'
  | 'salgados'
  | 'sorvetes'
  | 'italiana'
  | 'padarias'
  | 'carnes'
  | 'pastel'
  | 'vegetariana'
  | 'japonesa'
  | 'brasileira';

export interface VisualCategory {
  id: TagId;
  name: string;
  image: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Preço "de" — quando maior que `price`, o prato aparece como promoção. */
  originalPrice?: number;
  category: CategoryId;
  tags: TagId[];
  prepTime: number;
  image: string;
  available: boolean;
  popular: boolean;
  ingredients: string[];
}

export type Role = 'admin' | 'funcionario';

export interface StaffUser {
  id: string;
  name: string;
  role: Role;
  login: string;
  password: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  district: string;
  complement: string;
}

export type ServiceLocation = { mode: 'mesa'; table: string } | { mode: 'delivery'; address: Address };

export type PaymentMethod = 'cartao' | 'pix' | 'dinheiro';

export interface Payment {
  method: PaymentMethod;
  cardType?: 'credito' | 'debito';
  needsMachine?: boolean;
  changeFor?: number;
  status: 'pendente' | 'pago';
}

export type OrderStatus = 'pendente' | 'preparo' | 'pronto' | 'entregue';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: number;
  clientId: string;
  customerName: string;
  phone: string;
  location: ServiceLocation;
  items: OrderItem[];
  notes: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: Payment;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type Session =
  | { type: 'cliente'; clientId: string; name: string; phone: string; location: ServiceLocation }
  | { type: 'staff'; userId: string; name: string; role: Role };
```


## `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```


## `src/components/Cart.tsx`

```tsx
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

  const location = session?.type === 'cliente' ? session.location : null;
  const isDelivery = location?.mode === 'delivery';

  const finish = () => {
    const parsed = draftToPayment(payment, cartTotal);
    if (typeof parsed === 'string') return setError(parsed);
    const order = placeOrder(notes, parsed);
    if (order) {
      setNotes('');
      setPayment(emptyPayment);
      setError('');
      onOrderPlaced(order);
    }
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
        <Button size="lg" className="w-full justify-between" disabled={cartLines.length === 0} onClick={finish}>
          <span>Finalizar Pedido</span>
          <span>{formatPrice(cartTotal)}</span>
        </Button>
      </div>
    </div>
  );
}
```


## `src/components/CategoryCarousel.tsx`

```tsx
import type { TagId, VisualCategory } from '../types';
import HorizontalScroller from './HorizontalScroller';

interface Props {
  items: VisualCategory[];
  active: TagId | null;
  onSelect: (id: TagId | null) => void;
}

export default function CategoryCarousel({ items, active, onSelect }: Props) {
  return (
    <HorizontalScroller label="Categorias" className="gap-2 px-1 py-2">
      {items.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(isActive ? null : c.id)}
            aria-pressed={isActive}
            className="group flex w-24 shrink-0 snap-start flex-col items-center rounded-xl pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <div className="relative h-[76px] w-24">
              <div
                className={`absolute inset-x-0 top-0 h-14 rounded-t-xl transition-shadow ${isActive ? 'ring-2 ring-yellow-400' : ''}`}
                style={{ backgroundColor: c.color }}
              />
              <img
                src={c.image}
                alt=""
                loading="lazy"
                className="absolute left-1/2 top-3 h-[60px] w-[60px] -translate-x-1/2 rounded-full object-cover shadow-md ring-[3px] ring-white transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span className={`mt-1.5 text-center text-xs leading-tight text-zinc-700 ${isActive ? 'font-bold text-zinc-900' : 'font-medium'}`}>
              {c.name}
            </span>
            <span className={`mt-1 h-1 rounded-full transition-all ${isActive ? 'w-10 bg-yellow-400' : 'w-0 bg-transparent'}`} />
          </button>
        );
      })}
    </HorizontalScroller>
  );
}
```


## `src/components/FeaturedSection.tsx`

```tsx
import { ChevronRight, Clock, Flame, Star } from 'lucide-react';
import type { Category, Product } from '../types';
import { discountPercent, formatPrice, prepRange } from '../utils/format';
import HorizontalScroller from './HorizontalScroller';
import ProductImage from './ProductImage';

interface Props {
  products: Product[];
  categories: Category[];
  onOpen: (product: Product) => void;
  onSeeMore: () => void;
}

export default function FeaturedSection({ products, categories, onOpen, onSeeMore }: Props) {
  if (products.length === 0) return null;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900">Destaques do Pratello</h2>
          <p className="text-sm text-zinc-500">Os mais pedidos pelos nossos clientes</p>
        </div>
        <button onClick={onSeeMore} className="flex shrink-0 items-center gap-0.5 text-sm font-bold text-yellow-600 hover:text-yellow-700">
          Ver mais <ChevronRight size={16} />
        </button>
      </div>

      <HorizontalScroller label="Destaques" className="gap-3 px-1 py-1">
        {products.map((p) => {
          const off = discountPercent(p.price, p.originalPrice);
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="flex w-72 shrink-0 snap-start items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <ProductImage src={p.image} alt={p.name} className="h-20 w-20 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-zinc-900">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                  {p.popular ? <Star size={12} className="fill-yellow-400 text-yellow-400" /> : <Flame size={12} className="text-yellow-500" />}
                  {catName(p.category)} · <Clock size={12} /> {prepRange(p.prepTime)}
                </p>
                <p className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-extrabold text-zinc-900">{formatPrice(p.price)}</span>
                  {off > 0 && <span className="text-xs text-zinc-400 line-through">{formatPrice(p.originalPrice!)}</span>}
                  {off > 0 && <span className="rounded bg-yellow-400 px-1 text-[10px] font-bold text-zinc-900">-{off}%</span>}
                </p>
              </div>
            </button>
          );
        })}
      </HorizontalScroller>
    </section>
  );
}
```


## `src/components/HorizontalScroller.tsx`

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label: string;
  className?: string;
}

/**
 * Faixa com rolagem horizontal: arraste/scroll no celular e setas circulares no desktop.
 * As setas só aparecem quando há conteúdo para aquele lado.
 */
export default function HorizontalScroller({ children, label, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  // conteúdo mudou (ex.: filtro) → recalcula as setas
  useEffect(update, [children, update]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const arrow =
    'absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-zinc-300 bg-zinc-200 text-zinc-700 shadow-md transition-colors hover:bg-zinc-300 md:grid';

  return (
    <div className="relative">
      <div ref={ref} role="region" aria-label={label} className={`scrollbar-none flex snap-x overflow-x-auto ${className}`}>
        {children}
      </div>
      {canLeft && (
        <button onClick={() => scroll(-1)} className={`${arrow} -left-4`} aria-label="Anterior">
          <ChevronLeft size={18} />
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll(1)} className={`${arrow} -right-4`} aria-label="Próximo">
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
```


## `src/components/LocationForm.tsx`

```tsx
import { Armchair, Bike, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { TABLE_COUNT } from '../data/mockData';
import type { Address, ServiceLocation } from '../types';
import { Field, Input, Select } from './ui';

export interface LocationDraft {
  mode: 'mesa' | 'delivery';
  table: string;
  address: Address;
}

const emptyAddress: Address = { cep: '', street: '', number: '', district: '', complement: '' };

export const toDraft = (loc?: ServiceLocation): LocationDraft => ({
  mode: loc?.mode ?? 'mesa',
  table: loc?.mode === 'mesa' ? loc.table : '',
  address: loc?.mode === 'delivery' ? loc.address : emptyAddress,
});

/** Valida o rascunho e devolve a localização final, ou uma mensagem de erro. */
export function draftToLocation(d: LocationDraft): ServiceLocation | string {
  if (d.mode === 'mesa') return d.table ? { mode: 'mesa', table: d.table } : 'Selecione o número da mesa.';
  const a = d.address;
  if (a.cep.replace(/\D/g, '').length !== 8) return 'Informe um CEP válido.';
  if (!a.street.trim() || !a.number.trim() || !a.district.trim()) return 'Preencha rua, número e bairro.';
  return {
    mode: 'delivery',
    address: { cep: a.cep, street: a.street.trim(), number: a.number.trim(), district: a.district.trim(), complement: a.complement.trim() },
  };
}

const maskCep = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

const tables = Array.from({ length: TABLE_COUNT }, (_, i) => String(i + 1).padStart(2, '0'));

export default function LocationForm({ value, onChange }: { value: LocationDraft; onChange: (d: LocationDraft) => void }) {
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const setAddr = (patch: Partial<Address>) => onChange({ ...value, address: { ...value.address, ...patch } });

  // Preenche rua e bairro pelo CEP (ViaCEP). Sem internet, o cliente digita manualmente.
  const cepDigits = value.address.cep.replace(/\D/g, '');
  const lastLookup = useRef(cepDigits); // não sobrescreve um endereço já salvo ao abrir o formulário
  useEffect(() => {
    if (value.mode !== 'delivery' || cepDigits.length !== 8) return setCepStatus('idle');
    if (cepDigits === lastLookup.current) return;
    lastLookup.current = cepDigits;
    const ctrl = new AbortController();
    setCepStatus('loading');
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { erro?: boolean; logradouro?: string; bairro?: string }) => {
        if (data.erro) return setCepStatus('error');
        setCepStatus('idle');
        onChange({
          ...value,
          address: { ...value.address, street: data.logradouro || value.address.street, district: data.bairro || value.address.district },
        });
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setCepStatus('idle');
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepDigits, value.mode]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['mesa', 'Salão / Mesa', Armchair],
            ['delivery', 'Delivery', Bike],
          ] as const
        ).map(([mode, label, Icon]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ ...value, mode })}
            aria-pressed={value.mode === mode}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
              value.mode === mode ? 'border-yellow-400 bg-yellow-50 text-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {value.mode === 'mesa' ? (
        <Field label="Número da mesa">
          <Select value={value.table} onChange={(e) => onChange({ ...value, table: e.target.value })}>
            <option value="">Selecione a mesa…</option>
            {tables.map((t) => (
              <option key={t} value={t}>
                Mesa {t}
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <Field label="CEP" hint={cepStatus === 'error' ? 'CEP não encontrado.' : undefined}>
              <div className="relative">
                <Input inputMode="numeric" value={value.address.cep} onChange={(e) => setAddr({ cep: maskCep(e.target.value) })} placeholder="00000-000" />
                {cepStatus === 'loading' && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-zinc-400" />}
              </div>
            </Field>
          </div>
          <div className="col-span-3">
            <Field label="Número">
              <Input value={value.address.number} onChange={(e) => setAddr({ number: e.target.value })} placeholder="123" />
            </Field>
          </div>
          <div className="col-span-6">
            <Field label="Rua">
              <Input value={value.address.street} onChange={(e) => setAddr({ street: e.target.value })} placeholder="Rua das Flores" />
            </Field>
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Field label="Bairro">
              <Input value={value.address.district} onChange={(e) => setAddr({ district: e.target.value })} />
            </Field>
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Field label="Complemento">
              <Input value={value.address.complement} onChange={(e) => setAddr({ complement: e.target.value })} placeholder="Apto, bloco…" />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
```


## `src/components/Logo.tsx`

```tsx
import { Utensils } from 'lucide-react';

export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-zinc-900">
        <Utensils size={20} strokeWidth={2.5} />
      </span>
      <span className={`text-2xl ${light ? 'text-white' : 'text-zinc-900'}`}>Pratello</span>
    </span>
  );
}
```


## `src/components/Modal.tsx`

```tsx
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
```


## `src/components/OrderCard.tsx`

```tsx
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
        {order.items.map((it) => (
          <li key={it.productId} className="text-zinc-700">
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
```


## `src/components/PaymentSelector.tsx`

```tsx
import { Banknote, Check, Copy, CreditCard, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import type { PaymentInput } from '../context/AppContext';
import { PIX_KEY, PIX_MERCHANT } from '../data/mockData';
import type { PaymentMethod } from '../types';
import { formatPrice, parsePrice } from '../utils/format';
import { Input } from './ui';

export interface PaymentDraft {
  method: PaymentMethod | null;
  cardType: 'credito' | 'debito';
  needsMachine: boolean;
  changeFor: string;
  pixPaid: boolean;
}

export const emptyPayment: PaymentDraft = { method: null, cardType: 'credito', needsMachine: true, changeFor: '', pixPaid: false };

export function draftToPayment(d: PaymentDraft, total: number): PaymentInput | string {
  if (!d.method) return 'Escolha a forma de pagamento.';
  if (d.method === 'cartao') return { method: 'cartao', cardType: d.cardType, needsMachine: d.needsMachine };
  if (d.method === 'pix') return { method: 'pix', pixPaid: d.pixPaid };
  if (!d.changeFor.trim()) return { method: 'dinheiro' };
  const change = parsePrice(d.changeFor);
  if (!Number.isFinite(change) || change < total) return `O troco deve ser para um valor de pelo menos ${formatPrice(total)}.`;
  return { method: 'dinheiro', changeFor: change };
}

const OPTIONS = [
  { id: 'cartao', label: 'Cartão', sub: 'Crédito ou débito', icon: CreditCard },
  { id: 'pix', label: 'Pix', sub: 'Pague pelo app do banco', icon: QrCode },
  { id: 'dinheiro', label: 'Dinheiro', sub: 'Troco opcional', icon: Banknote },
] as const;

interface Props {
  value: PaymentDraft;
  onChange: (d: PaymentDraft) => void;
  total: number;
  isDelivery: boolean;
}

export default function PaymentSelector({ value, onChange, total, isDelivery }: Props) {
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<PaymentDraft>) => onChange({ ...value, ...patch });

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  // QR propositalmente NÃO segue o padrão BR Code: é só demonstração e não pode gerar um pagamento real.
  const qrValue = `PIX SIMULADO | ${PIX_MERCHANT} | ${formatPrice(total)} | NAO PAGUE - DEMONSTRACAO A3`;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-zinc-800">Forma de Pagamento</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ id, label, sub, icon: Icon }) => {
          const active = value.method === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => set({ method: id })}
              aria-pressed={active}
              className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-3 text-center transition-colors ${
                active ? 'border-yellow-400 bg-yellow-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              {active && (
                <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-yellow-400">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
              <Icon size={20} className={active ? 'text-zinc-900' : 'text-zinc-500'} />
              <span className="text-xs font-bold text-zinc-900">{label}</span>
              <span className="hidden text-[10px] leading-tight text-zinc-500 sm:block">{sub}</span>
            </button>
          );
        })}
      </div>

      {value.method === 'cartao' && (
        <div className="mt-3 space-y-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-200/70 p-1">
            {(['credito', 'debito'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ cardType: t })}
                className={`rounded-md py-1.5 text-xs font-semibold ${value.cardType === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'}`}
              >
                {t === 'credito' ? 'Crédito' : 'Débito'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={value.needsMachine} onChange={(e) => set({ needsMachine: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
            {isDelivery ? 'Entregador deve levar a maquininha' : 'Preciso da maquininha na mesa'}
          </label>
        </div>
      )}

      {value.method === 'pix' && (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <div className="flex gap-3">
            <div className="shrink-0 rounded-lg bg-white p-2 ring-1 ring-zinc-200">
              <QRCodeSVG value={qrValue} size={88} />
            </div>
            <div className="min-w-0 text-xs">
              <p className="font-semibold text-zinc-800">Chave Pix (simulada)</p>
              <div className="mt-1 flex items-center gap-1">
                <code className="truncate rounded bg-white px-1.5 py-1 text-zinc-700 ring-1 ring-zinc-200">{PIX_KEY}</code>
                <button type="button" onClick={copyKey} className="rounded p-1 text-zinc-500 hover:bg-zinc-200" aria-label="Copiar chave Pix">
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="mt-1 text-zinc-500">Valor: <b className="text-zinc-800">{formatPrice(total)}</b></p>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={value.pixPaid} onChange={(e) => set({ pixPaid: e.target.checked })} className="h-4 w-4 accent-yellow-400" />
            Já fiz o pagamento (simulação)
          </label>
        </div>
      )}

      {value.method === 'dinheiro' && (
        <div className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-700">Troco para quanto? <span className="text-zinc-400">(opcional)</span></span>
            <Input inputMode="decimal" value={value.changeFor} onChange={(e) => set({ changeFor: e.target.value })} placeholder={`Ex: ${Math.ceil((total + 1) / 50) * 50}`} />
          </label>
        </div>
      )}
    </div>
  );
}
```


## `src/components/ProductCard.tsx`

```tsx
import { Clock, Flame, Plus } from 'lucide-react';
import type { Product } from '../types';
import { discountPercent, formatPrice, prepRange } from '../utils/format';
import ProductImage from './ProductImage';

interface Props {
  product: Product;
  inCart: number;
  onAdd: () => void;
  onOpen: () => void;
}

export default function ProductCard({ product, onAdd, onOpen, inCart }: Props) {
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button onClick={onOpen} className="relative block overflow-hidden text-left" aria-label={`Ver detalhes de ${product.name}`}>
        <ProductImage src={product.image} alt={product.name} className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-zinc-900 shadow">
              <Flame size={12} /> Mais pedido
            </span>
          )}
          {off > 0 && <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-bold text-yellow-400 shadow">-{off}%</span>}
        </div>
        {inCart > 0 && (
          <span className="absolute right-3 top-3 grid h-7 min-w-7 place-items-center rounded-full bg-zinc-900 px-2 text-xs font-bold text-white">
            {inCart}
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <button onClick={onOpen} className="text-left">
          <h3 className="font-bold text-zinc-900 hover:underline">{product.name}</h3>
        </button>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-zinc-600">{product.description}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
          <Clock size={12} /> {prepRange(product.prepTime)}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
            {off > 0 && <span className="text-xs text-zinc-400 line-through">{formatPrice(product.originalPrice!)}</span>}
          </div>
          <button
            onClick={onAdd}
            aria-label={`Adicionar ${product.name}`}
            className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-zinc-900 transition-colors hover:bg-yellow-500 active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
```


## `src/components/ProductImage.tsx`

```tsx
import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Imagem com fallback caso a URL esteja quebrada ou vazia. */
export default function ProductImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-zinc-200 text-zinc-400 ${className}`} aria-label={alt}>
        <ImageOff size={28} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
```


## `src/components/ProductModal.tsx`

```tsx
import { Clock, Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { discountPercent, formatPrice, prepRange } from '../utils/format';
import ProductImage from './ProductImage';

interface Props {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
}

/** Detalhes do prato com seletor de quantidade (estilo marketplace). */
export default function ProductModal({ product, onClose, onAdd }: Props) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/60 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-3xl sm:flex-row sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 sm:w-1/2">
          <ProductImage src={product.image} alt={product.name} className="h-56 w-full sm:h-full" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-700 shadow hover:bg-white sm:hidden"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-zinc-900">{product.name}</h2>
              <button onClick={onClose} className="hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 sm:block" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{product.description}</p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-sm text-zinc-400 line-through">{formatPrice(product.originalPrice!)}</span>
                  <span className="rounded-md bg-yellow-400 px-1.5 py-0.5 text-xs font-bold text-zinc-900">-{off}%</span>
                </>
              )}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500">
              <Clock size={14} /> Preparo estimado: {prepRange(product.prepTime)}
            </p>

            {product.ingredients.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Ingredientes</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((i) => (
                    <span key={i} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-200 p-4">
            <div className="flex items-center rounded-xl border border-zinc-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-zinc-600 hover:bg-zinc-100" aria-label="Diminuir">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 text-zinc-600 hover:bg-zinc-100" aria-label="Aumentar">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => onAdd(product, qty)}
              className="flex flex-1 items-center justify-between rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-yellow-500"
            >
              <span>Adicionar</span>
              <span>{formatPrice(product.price * qty)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```


## `src/components/ProtectedRoute.tsx`

```tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { homeFor } from '../utils/routes';
import { useApp } from '../context/AppContext';

type Profile = 'cliente' | 'funcionario' | 'admin';

export default function ProtectedRoute({ allow, children }: { allow: Profile[]; children: ReactNode }) {
  const { session } = useApp();
  if (!session) return <Navigate to="/" replace />;
  const profile: Profile = session.type === 'cliente' ? 'cliente' : session.role;
  if (!allow.includes(profile)) return <Navigate to={homeFor(session)} replace />;
  return <>{children}</>;
}
```


## `src/components/ui.tsx`

```tsx
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { OrderStatus } from '../types';
import { STATUS_LABEL } from '../utils/format';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2';

const variants = {
  primary: 'bg-yellow-400 text-zinc-900 hover:bg-yellow-500',
  dark: 'bg-zinc-900 text-white hover:bg-zinc-800',
  ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100',
  outline: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40';

export const Input = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${inputCls} ${className}`} {...props} />
);

export const Textarea = ({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`${inputCls} resize-none ${className}`} {...props} />
);

export const Select = ({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={`${inputCls} ${className}`} {...props} />
);

const statusStyle: Record<OrderStatus, string> = {
  pendente: 'bg-zinc-100 text-zinc-700 ring-zinc-300',
  preparo: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
  pronto: 'bg-green-100 text-green-800 ring-green-300',
  entregue: 'bg-zinc-800 text-zinc-100 ring-zinc-700',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyle[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
```


## `src/context/AppContext.tsx`

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, categories, createSeedOrders, seedProducts, seedUsers, visualCategories } from '../data/mockData';
import type { CartItem, Category, Order, Payment, Product, ServiceLocation, Session, StaffUser, VisualCategory } from '../types';
import { STATUS_FLOW, uid } from '../utils/format';

/* ---------- Persistência ---------- */

// "v2": formato com vitrine, localização e pagamento. Mudar a versão recria os dados de exemplo.
const KEYS = {
  products: 'pratello:v2:products',
  users: 'pratello:v2:users',
  orders: 'pratello:v2:orders',
  session: 'pratello:v2:session', // sessionStorage: cada aba tem seu próprio login (cliente numa aba, cozinha na outra)
  cart: 'pratello:v2:cart',
} as const;

function read<T>(storage: Storage, key: string): T | undefined {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    if (value === null || value === undefined) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível: segue apenas em memória */
  }
}

/** Estado persistido no localStorage e sincronizado entre abas (evento `storage`). */
function useSharedState<T>(key: string, initial: () => T) {
  const [state, setState] = useState<T>(() => read<T>(localStorage, key) ?? initial());

  useEffect(() => write(localStorage, key, state), [key, state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      setState(e.newValue ? (JSON.parse(e.newValue) as T) : initial());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState] as const;
}

/** Estado por aba (sessionStorage). */
function useTabState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => read<T>(sessionStorage, key) ?? initial);
  useEffect(() => write(sessionStorage, key, state), [key, state]);
  return [state, setState] as const;
}

/* ---------- Contexto ---------- */

export interface CartLine {
  product: Product;
  quantity: number;
}

export type ProductInput = Omit<Product, 'id'> & { id?: string };
export type UserInput = Omit<StaffUser, 'id'> & { id?: string };
export type PaymentInput = Omit<Payment, 'status'> & { pixPaid?: boolean };

interface AppContextValue {
  categories: Category[];
  visualCategories: VisualCategory[];
  products: Product[];
  users: StaffUser[];
  orders: Order[];
  session: Session | null;
  currentUser: StaffUser | null;

  loginClient: (name: string, phone: string, location: ServiceLocation) => void;
  updateLocation: (location: ServiceLocation) => void;
  loginStaff: (login: string, password: string) => StaffUser | null;
  logout: () => void;

  cartLines: CartLine[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number) => void;
  changeQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: (notes: string, payment: PaymentInput) => Order | null;

  advanceOrder: (orderId: string) => void;
  markOrderPaid: (orderId: string) => void;

  saveProduct: (input: ProductInput) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;

  saveUser: (input: UserInput) => string | null;
  deleteUser: (id: string) => string | null;

  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useSharedState<Product[]>(KEYS.products, () => seedProducts);
  const [users, setUsers] = useSharedState<StaffUser[]>(KEYS.users, () => seedUsers);
  const [orders, setOrders] = useSharedState<Order[]>(KEYS.orders, createSeedOrders);
  const [session, setSession] = useTabState<Session | null>(KEYS.session, null);
  const [cart, setCart] = useTabState<CartItem[]>(KEYS.cart, []);

  const currentUser = useMemo(
    () => (session?.type === 'staff' ? users.find((u) => u.id === session.userId) ?? null : null),
    [session, users],
  );

  // Se o funcionário logado for excluído por um admin, encerra a sessão.
  useEffect(() => {
    if (session?.type === 'staff' && !currentUser) setSession(null);
  }, [session, currentUser, setSession]);

  /* Autenticação */
  const loginClient = useCallback(
    (name: string, phone: string, location: ServiceLocation) => {
      setSession({ type: 'cliente', clientId: uid('c'), name: name.trim(), phone: phone.trim(), location });
      setCart([]);
    },
    [setSession, setCart],
  );

  const updateLocation = useCallback(
    (location: ServiceLocation) => setSession((s) => (s?.type === 'cliente' ? { ...s, location } : s)),
    [setSession],
  );

  const loginStaff = useCallback(
    (login: string, password: string) => {
      const user = users.find((u) => u.login.toLowerCase() === login.trim().toLowerCase() && u.password === password);
      if (user) setSession({ type: 'staff', userId: user.id, name: user.name, role: user.role });
      return user ?? null;
    },
    [users, setSession],
  );

  const logout = useCallback(() => {
    setSession(null);
    setCart([]);
  }, [setSession, setCart]);

  /* Carrinho — reflete preço/disponibilidade atuais do cardápio */
  const cartLines = useMemo<CartLine[]>(
    () =>
      cart.flatMap((ci) => {
        const product = products.find((p) => p.id === ci.productId);
        return product && product.available ? [{ product, quantity: ci.quantity }] : [];
      }),
    [cart, products],
  );
  const cartCount = cartLines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = cartLines.reduce((s, l) => s + l.quantity * l.product.price, 0);
  const isDelivery = session?.type === 'cliente' && session.location.mode === 'delivery';
  const deliveryFee = isDelivery && subtotal > 0 && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  const cartTotal = subtotal + deliveryFee;

  const addToCart = useCallback(
    (productId: string, quantity = 1) =>
      setCart((prev) =>
        prev.some((c) => c.productId === productId)
          ? prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c))
          : [...prev, { productId, quantity }],
      ),
    [setCart],
  );

  const changeQuantity = useCallback(
    (productId: string, delta: number) =>
      setCart((prev) =>
        prev
          .map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + delta } : c))
          .filter((c) => c.quantity > 0),
      ),
    [setCart],
  );

  const removeFromCart = useCallback(
    (productId: string) => setCart((prev) => prev.filter((c) => c.productId !== productId)),
    [setCart],
  );

  const placeOrder = useCallback(
    (notes: string, { pixPaid, ...payment }: PaymentInput) => {
      if (session?.type !== 'cliente' || cartLines.length === 0) return null;
      const now = Date.now();
      const order: Order = {
        id: uid('o'),
        number: orders.reduce((max, o) => Math.max(max, o.number), 100) + 1,
        clientId: session.clientId,
        customerName: session.name,
        phone: session.phone,
        location: session.location,
        items: cartLines.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        notes: notes.trim(),
        subtotal,
        deliveryFee,
        total: cartTotal,
        payment: { ...payment, status: payment.method === 'pix' && pixPaid ? 'pago' : 'pendente' },
        status: 'pendente',
        createdAt: now,
        updatedAt: now,
      };
      setOrders((prev) => [...prev, order]);
      setCart([]);
      return order;
    },
    [session, cartLines, subtotal, deliveryFee, cartTotal, orders, setOrders, setCart],
  );

  /* Pedidos */
  const advanceOrder = useCallback(
    (orderId: string) =>
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
          return next ? { ...o, status: next, updatedAt: Date.now() } : o;
        }),
      ),
    [setOrders],
  );

  const markOrderPaid = useCallback(
    (orderId: string) =>
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment: { ...o.payment, status: 'pago' } } : o))),
    [setOrders],
  );

  /* Cardápio */
  const saveProduct = useCallback(
    (input: ProductInput) =>
      setProducts((prev) =>
        input.id
          ? prev.map((p) => (p.id === input.id ? ({ ...input, id: p.id } as Product) : p))
          : [...prev, { ...input, id: uid('p') }],
      ),
    [setProducts],
  );

  const deleteProduct = useCallback(
    (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)),
    [setProducts],
  );

  const toggleProductAvailability = useCallback(
    (id: string) => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))),
    [setProducts],
  );

  /* Funcionários */
  const saveUser = useCallback(
    (input: UserInput) => {
      const login = input.login.trim().toLowerCase();
      if (users.some((u) => u.login.toLowerCase() === login && u.id !== input.id)) {
        return 'Já existe um funcionário com esse login.';
      }
      if (input.id) {
        const target = users.find((u) => u.id === input.id);
        const admins = users.filter((u) => u.role === 'admin');
        if (target?.role === 'admin' && input.role !== 'admin' && admins.length === 1) {
          return 'É necessário manter pelo menos um administrador.';
        }
        setUsers((prev) => prev.map((u) => (u.id === input.id ? ({ ...input, login, id: u.id } as StaffUser) : u)));
        if (session?.type === 'staff' && session.userId === input.id) {
          setSession({ ...session, name: input.name, role: input.role });
        }
      } else {
        setUsers((prev) => [...prev, { ...input, login, id: uid('u') }]);
      }
      return null;
    },
    [users, setUsers, session, setSession],
  );

  const deleteUser = useCallback(
    (id: string) => {
      if (session?.type === 'staff' && session.userId === id) return 'Você não pode excluir o próprio usuário.';
      const target = users.find((u) => u.id === id);
      if (target?.role === 'admin' && users.filter((u) => u.role === 'admin').length === 1) {
        return 'É necessário manter pelo menos um administrador.';
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return null;
    },
    [session, users, setUsers],
  );

  const resetDemoData = useCallback(() => {
    setProducts(seedProducts);
    setOrders(createSeedOrders());
    setUsers((prev) => {
      // mantém o usuário atual para não derrubar a sessão
      const me = session?.type === 'staff' ? prev.find((u) => u.id === session.userId) : undefined;
      return me && !seedUsers.some((u) => u.id === me.id) ? [...seedUsers, me] : seedUsers;
    });
  }, [setProducts, setOrders, setUsers, session]);

  const value: AppContextValue = {
    categories,
    visualCategories,
    products,
    users,
    orders,
    session,
    currentUser,
    loginClient,
    updateLocation,
    loginStaff,
    logout,
    cartLines,
    cartCount,
    subtotal,
    deliveryFee,
    cartTotal,
    addToCart,
    changeQuantity,
    removeFromCart,
    placeOrder,
    advanceOrder,
    markOrderPaid,
    saveProduct,
    deleteProduct,
    toggleProductAvailability,
    saveUser,
    deleteUser,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>');
  return ctx;
}
```


## `src/data/mockData.ts`

```ts
import type { Category, Order, OrderItem, Product, StaffUser, VisualCategory } from '../types';

const img = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const LOGIN_HERO_IMAGE = img('1504674900247-0877df9cc836', 1400);

/* ---------- Regras do negócio (valores de demonstração) ---------- */

export const DELIVERY_FEE = 7.9;
export const FREE_DELIVERY_FROM = 100;
export const TABLE_COUNT = 20;
export const PIX_KEY = 'pix@pratello.com.br';
export const PIX_MERCHANT = 'PRATELLO RESTAURANTE';

/* ---------- Categorias ---------- */

export const categories: Category[] = [
  { id: 'lanches', name: 'Lanches' },
  { id: 'pratos', name: 'Pratos Principais' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'sobremesas', name: 'Sobremesas' },
];

const PASTEL = ['#FEF08A', '#E4E4E7', '#FDE68A', '#F4F4F5'];

export const visualCategories: VisualCategory[] = (
  [
    ['promocoes', 'Promoções', '1553979459-d2229ba7433b'],
    ['saudavel', 'Saudável', '1546069901-ba9599a7e63c'],
    ['arabe', 'Árabe', '1529006557810-274b9b2fc783'],
    ['acai', 'Açaí', '1615478503562-ec2d8aa0e24e'],
    ['doces', 'Doces & Bolos', '1551024601-bec78aea704b'],
    ['chinesa', 'Chinesa', '1585032226651-759b368d7246'],
    ['pizza', 'Pizza', '1513104890138-7c749659a591'],
    ['lanches', 'Lanches', '1568901346375-23c9450c58cd'],
    ['salgados', 'Salgados', '1606491956689-2ea866880c84'],
    ['sorvetes', 'Sorvetes', '1563805042-7684c019e1cb'],
    ['italiana', 'Italiana', '1621996346565-e3dbc646d9a9'],
    ['padarias', 'Padarias', '1555507036-ab1f4038808a'],
    ['carnes', 'Carnes', '1544025162-d76694265947'],
    ['pastel', 'Pastel', '1601050690597-df0568f70950'],
    ['vegetariana', 'Vegetariana', '1625944230945-1b7dd3b949ab'],
    ['japonesa', 'Japonesa', '1579871494447-9811cf80d66c'],
    ['brasileira', 'Brasileira', '1631515243349-e0cb75fb8d3a'],
  ] as const
).map(([id, name, photo], i) => ({ id, name, image: img(photo, 200), color: PASTEL[i % PASTEL.length] }));

/* ---------- Pratos ---------- */

type Seed = Omit<Product, 'id' | 'image' | 'available'> & { photo: string };

const seeds: Seed[] = [
  { name: 'Pratello Burger Clássico', description: 'Blend bovino de 180g, cheddar derretido, alface, tomate e molho da casa no pão brioche.', price: 32.9, originalPrice: 38.9, category: 'lanches', tags: ['lanches', 'promocoes'], prepTime: 20, popular: true, ingredients: ['pão brioche', 'carne', 'cheddar', 'alface', 'tomate'], photo: '1568901346375-23c9450c58cd' },
  { name: 'Smash Duplo Bacon', description: 'Dois smash burgers, bacon crocante, queijo prato e cebola caramelizada.', price: 38.9, category: 'lanches', tags: ['lanches', 'carnes'], prepTime: 20, popular: true, ingredients: ['carne', 'bacon', 'queijo prato', 'cebola'], photo: '1553979459-d2229ba7433b' },
  { name: 'Sanduíche Natural de Frango', description: 'Pão integral, frango desfiado, cenoura, requeijão e folhas verdes.', price: 24.9, category: 'lanches', tags: ['lanches', 'saudavel'], prepTime: 10, popular: false, ingredients: ['pão integral', 'frango', 'cenoura', 'requeijão'], photo: '1528735602780-2552fd46c7af' },
  { name: 'Batata Frita Rústica', description: 'Porção de batatas rústicas com páprica defumada e maionese de alho.', price: 18.9, category: 'lanches', tags: ['lanches', 'salgados', 'vegetariana'], prepTime: 15, popular: true, ingredients: ['batata', 'páprica', 'alho', 'maionese'], photo: '1573080496219-bb080dd4f877' },
  { name: 'Shawarma de Frango', description: 'Pão sírio recheado com frango temperado, legumes frescos e molho de alho.', price: 29.9, category: 'lanches', tags: ['arabe'], prepTime: 15, popular: false, ingredients: ['pão sírio', 'frango', 'alho', 'tomate', 'cebola roxa'], photo: '1529006557810-274b9b2fc783' },
  { name: 'Guioza (6 un.)', description: 'Pastéis chineses grelhados recheados de porco e legumes, com molho shoyu.', price: 24.9, category: 'lanches', tags: ['chinesa'], prepTime: 15, popular: false, ingredients: ['carne de porco', 'repolho', 'shoyu', 'gengibre'], photo: '1496116218417-1a781b1c416c' },
  { name: 'Sanduíche Vegano', description: 'Hambúrguer de grão-de-bico, abacate, pepino, cenoura e pão de fermentação natural.', price: 27.9, category: 'lanches', tags: ['vegetariana', 'saudavel'], prepTime: 15, popular: false, ingredients: ['grão-de-bico', 'abacate', 'pepino', 'cenoura'], photo: '1592415486689-125cbbfcbee2' },
  { name: 'Pão de Queijo (10 un.)', description: 'Pão de queijo mineiro quentinho, crocante por fora e macio por dentro.', price: 14.9, category: 'lanches', tags: ['salgados', 'padarias', 'brasileira'], prepTime: 10, popular: true, ingredients: ['polvilho', 'queijo minas'], photo: '1606491956689-2ea866880c84' },
  { name: 'Frango a Passarinho', description: 'Porção de frango frito crocante com alho e limão.', price: 34.9, category: 'lanches', tags: ['salgados', 'brasileira'], prepTime: 20, popular: false, ingredients: ['frango', 'alho', 'limão'], photo: '1626082927389-6cd097cdc6ec' },
  { name: 'Pastel de Carne (2 un.)', description: 'Massa crocante recheada com carne moída temperada, azeitona e ovo.', price: 16.9, category: 'lanches', tags: ['pastel', 'salgados'], prepTime: 15, popular: false, ingredients: ['carne moída', 'azeitona', 'ovo'], photo: '1601050690597-df0568f70950' },
  { name: 'Croissant de Presunto e Queijo', description: 'Croissant amanteigado recheado com presunto e queijo derretido.', price: 13.9, category: 'lanches', tags: ['padarias'], prepTime: 10, popular: false, ingredients: ['manteiga', 'presunto', 'queijo'], photo: '1555507036-ab1f4038808a' },
  { name: 'Pão Rústico Artesanal', description: 'Pão de fermentação natural com casca crocante. Acompanha manteiga.', price: 18.9, category: 'lanches', tags: ['padarias'], prepTime: 5, popular: false, ingredients: ['farinha integral', 'fermento natural', 'manteiga'], photo: '1509440159596-0249088772ff' },

  { name: 'Filé ao Molho Madeira', description: 'Medalhão de filé mignon ao molho madeira com arroz e batatas sautée.', price: 59.9, category: 'pratos', tags: ['carnes', 'brasileira'], prepTime: 30, popular: true, ingredients: ['filé mignon', 'cogumelos', 'arroz', 'batata'], photo: '1600891964092-4316c288032e' },
  { name: 'Costela Barbecue', description: 'Costela suína assada lentamente com molho barbecue, vinagrete e fritas.', price: 69.9, category: 'pratos', tags: ['carnes'], prepTime: 35, popular: true, ingredients: ['costela suína', 'barbecue', 'batata', 'tomate'], photo: '1544025162-d76694265947' },
  { name: 'Carne de Panela', description: 'Carne cozida lentamente com batata, cenoura e caldo encorpado.', price: 44.9, category: 'pratos', tags: ['brasileira', 'carnes'], prepTime: 25, popular: false, ingredients: ['acém', 'batata', 'cenoura'], photo: '1541518763669-27fef04b14ea' },
  { name: 'Galinhada Mineira', description: 'Arroz cremoso com frango, açafrão, milho e cheiro-verde.', price: 38.9, originalPrice: 44.9, category: 'pratos', tags: ['brasileira', 'promocoes'], prepTime: 25, popular: false, ingredients: ['frango', 'arroz', 'açafrão', 'milho'], photo: '1631515243349-e0cb75fb8d3a' },
  { name: 'Spaghetti à Bolonhesa', description: 'Massa al dente com molho de tomate artesanal e carne moída, finalizada com parmesão.', price: 42.9, category: 'pratos', tags: ['italiana'], prepTime: 25, popular: false, ingredients: ['massa', 'tomate', 'carne moída', 'parmesão'], photo: '1621996346565-e3dbc646d9a9' },
  { name: 'Spaghetti com Camarão', description: 'Spaghetti salteado com camarões, tomate-cereja, alho e salsinha.', price: 58.9, category: 'pratos', tags: ['italiana'], prepTime: 25, popular: false, ingredients: ['massa', 'camarão', 'tomate-cereja', 'alho'], photo: '1563379926898-05f4575a45d8' },
  { name: 'Pizza Margherita', description: 'Massa de fermentação natural, molho de tomate, muçarela de búfala e manjericão.', price: 45.9, category: 'pratos', tags: ['pizza', 'italiana', 'vegetariana'], prepTime: 30, popular: true, ingredients: ['tomate', 'muçarela', 'manjericão'], photo: '1513104890138-7c749659a591' },
  { name: 'Pizza Calabresa', description: 'Calabresa fatiada, cebola, muçarela e orégano.', price: 49.9, category: 'pratos', tags: ['pizza'], prepTime: 30, popular: false, ingredients: ['calabresa', 'cebola', 'muçarela', 'orégano'], photo: '1594007654729-407eedc4be65' },
  { name: 'Combinado Japonês (16 peças)', description: 'Sushis e uramakis variados de salmão, com gengibre e wasabi.', price: 64.9, category: 'pratos', tags: ['japonesa'], prepTime: 25, popular: true, ingredients: ['salmão', 'arroz', 'alga nori', 'cream cheese'], photo: '1579871494447-9811cf80d66c' },
  { name: 'Sushi Variado (10 peças)', description: 'Seleção do chef com nigiris de salmão, atum e peixe branco.', price: 44.9, category: 'pratos', tags: ['japonesa'], prepTime: 20, popular: false, ingredients: ['salmão', 'atum', 'arroz'], photo: '1617196034796-73dfa7b1fd56' },
  { name: 'Bowl de Salmão (Poke)', description: 'Salmão em cubos, arroz, edamame, manga, pepino e molho tarê.', price: 47.9, category: 'pratos', tags: ['saudavel', 'japonesa'], prepTime: 15, popular: false, ingredients: ['salmão', 'arroz', 'manga', 'pepino', 'edamame'], photo: '1546069901-ba9599a7e63c' },
  { name: 'Yakisoba de Legumes', description: 'Macarrão oriental salteado com legumes e molho shoyu.', price: 36.9, category: 'pratos', tags: ['chinesa', 'vegetariana'], prepTime: 20, popular: false, ingredients: ['macarrão', 'brócolis', 'cenoura', 'shoyu'], photo: '1585032226651-759b368d7246' },
  { name: 'Frango Grelhado com Legumes', description: 'Peito de frango grelhado com ervas, legumes salteados e arroz integral.', price: 39.9, category: 'pratos', tags: ['saudavel'], prepTime: 25, popular: false, ingredients: ['frango', 'brócolis', 'cenoura', 'arroz integral'], photo: '1532550907401-a500c9a57435' },
  { name: 'Salada Caesar', description: 'Alface americana, croutons, lascas de parmesão, frango e molho caesar.', price: 29.9, category: 'pratos', tags: ['saudavel'], prepTime: 10, popular: false, ingredients: ['alface', 'croutons', 'parmesão', 'frango'], photo: '1512621776951-a57141f2eefd' },
  { name: 'Salada Grega', description: 'Tomate, pepino, azeitonas, cebola roxa e queijo feta com azeite.', price: 31.9, category: 'pratos', tags: ['vegetariana', 'saudavel'], prepTime: 10, popular: false, ingredients: ['tomate', 'pepino', 'azeitona', 'queijo feta'], photo: '1625944230945-1b7dd3b949ab' },

  { name: 'Suco de Laranja Natural', description: 'Copo de 400ml, espremido na hora.', price: 9.9, category: 'bebidas', tags: ['saudavel'], prepTime: 5, popular: true, ingredients: ['laranja'], photo: '1600271886742-f049cd451bba' },
  { name: 'Suco de Manga', description: 'Manga batida com gelo. 400ml.', price: 10.9, category: 'bebidas', tags: ['saudavel'], prepTime: 5, popular: false, ingredients: ['manga'], photo: '1625938145744-e380515399bf' },
  { name: 'Refrigerante Lata', description: 'Lata de 350ml. Consulte os sabores disponíveis.', price: 6.9, category: 'bebidas', tags: [], prepTime: 2, popular: false, ingredients: [], photo: '1622483767028-3f66f32aef97' },
  { name: 'Café Espresso', description: 'Espresso encorpado de grãos especiais.', price: 6.5, category: 'bebidas', tags: ['padarias'], prepTime: 5, popular: false, ingredients: ['café'], photo: '1509042239860-f550ce710b93' },
  { name: 'Limonada Suíça', description: 'Limão batido com gelo e leite condensado. 400ml.', price: 11.9, category: 'bebidas', tags: [], prepTime: 5, popular: false, ingredients: ['limão', 'leite condensado'], photo: '1556679343-c7306c1976bc' },
  { name: 'Milkshake de Chocolate', description: 'Sorvete de chocolate batido com leite, chantilly e calda. 500ml.', price: 21.9, originalPrice: 25.9, category: 'bebidas', tags: ['sorvetes', 'promocoes'], prepTime: 10, popular: false, ingredients: ['sorvete', 'chocolate', 'chantilly'], photo: '1577805947697-89e18249d767' },

  { name: 'Açaí no Copo 500ml', description: 'Açaí batido com banana, granola e leite em pó. Monte do seu jeito.', price: 19.9, originalPrice: 24.9, category: 'sobremesas', tags: ['acai', 'promocoes', 'saudavel'], prepTime: 5, popular: true, ingredients: ['açaí', 'banana', 'granola', 'leite em pó'], photo: '1615478503562-ec2d8aa0e24e' },
  { name: 'Bolo de Chocolate', description: 'Fatia generosa de bolo de chocolate com ganache meio amargo.', price: 16.9, category: 'sobremesas', tags: ['doces'], prepTime: 5, popular: true, ingredients: ['chocolate', 'ganache'], photo: '1578985545062-69928b1d9587' },
  { name: 'Cheesecake de Frutas Vermelhas', description: 'Base crocante, creme de cream cheese e calda de frutas vermelhas.', price: 18.9, category: 'sobremesas', tags: ['doces'], prepTime: 5, popular: false, ingredients: ['cream cheese', 'frutas vermelhas'], photo: '1533134242443-d4fd215305ad' },
  { name: 'Donuts Recheados (2 un.)', description: 'Donuts com cobertura de chocolate e granulado colorido.', price: 15.9, category: 'sobremesas', tags: ['doces', 'padarias'], prepTime: 5, popular: false, ingredients: ['chocolate', 'granulado'], photo: '1551024601-bec78aea704b' },
  { name: 'Cookies (4 un.)', description: 'Cookies amanteigados com gotas de chocolate.', price: 12.9, category: 'sobremesas', tags: ['doces', 'padarias'], prepTime: 5, popular: false, ingredients: ['chocolate', 'manteiga'], photo: '1558961363-fa8fdf82db35' },
  { name: 'Sorvete Artesanal', description: 'Duas bolas de sorvete artesanal com calda à sua escolha.', price: 14.9, category: 'sobremesas', tags: ['sorvetes'], prepTime: 5, popular: false, ingredients: ['sorvete', 'calda'], photo: '1563805042-7684c019e1cb' },
];

export const seedProducts: Product[] = seeds.map(({ photo, ...s }, i) => ({
  ...s,
  id: `p${i + 1}`,
  image: img(photo),
  available: true,
}));

/* ---------- Equipe ---------- */

export const seedUsers: StaffUser[] = [
  { id: 'u1', name: 'Ana Administradora', role: 'admin', login: 'admin@pratello.com', password: '1234' },
  { id: 'u2', name: 'Carlos Cozinha', role: 'funcionario', login: 'cozinha@pratello.com', password: '1234' },
];

/* ---------- Pedidos de exemplo ---------- */

const line = (name: string, quantity: number): OrderItem => {
  const p = seedProducts.find((x) => x.name === name)!;
  return { productId: p.id, name: p.name, price: p.price, quantity };
};

const mesa = (n: number) => ({ mode: 'mesa' as const, table: String(n).padStart(2, '0') });

/** Pedidos com horários relativos ao primeiro carregamento, para o dashboard ter dados do dia. */
export function createSeedOrders(): Order[] {
  const now = Date.now();
  const raw: Array<Pick<Order, 'customerName' | 'phone' | 'location' | 'items' | 'notes' | 'payment' | 'status'> & { ago: number }> = [
    { customerName: 'Marina', phone: '', location: mesa(4), items: [line('Pratello Burger Clássico', 2), line('Batata Frita Rústica', 1), line('Refrigerante Lata', 2)], notes: '', payment: { method: 'cartao', cardType: 'credito', needsMachine: true, status: 'pago' }, status: 'entregue', ago: 180 },
    { customerName: 'João', phone: '(11) 97777-2020', location: { mode: 'delivery', address: { cep: '01310-100', street: 'Av. Paulista', number: '1000', district: 'Bela Vista', complement: 'Apto 52' } }, items: [line('Filé ao Molho Madeira', 1), line('Suco de Laranja Natural', 1)], notes: 'Filé ao ponto', payment: { method: 'pix', status: 'pago' }, status: 'entregue', ago: 150 },
    { customerName: 'Luiza', phone: '', location: mesa(2), items: [line('Pizza Margherita', 1), line('Limonada Suíça', 2), line('Bolo de Chocolate', 1)], notes: '', payment: { method: 'dinheiro', changeFor: 100, status: 'pago' }, status: 'entregue', ago: 120 },
    { customerName: 'Pedro', phone: '(11) 98888-1234', location: { mode: 'delivery', address: { cep: '04538-132', street: 'Rua das Flores', number: '123', district: 'Itaim Bibi', complement: '' } }, items: [line('Combinado Japonês (16 peças)', 1), line('Açaí no Copo 500ml', 1)], notes: 'Sem wasabi', payment: { method: 'pix', status: 'pago' }, status: 'entregue', ago: 95 },
    { customerName: 'Beatriz', phone: '', location: mesa(9), items: [line('Salada Caesar', 1), line('Café Espresso', 2)], notes: '', payment: { method: 'cartao', cardType: 'debito', needsMachine: true, status: 'pendente' }, status: 'pronto', ago: 25 },
    { customerName: 'Rafael', phone: '(11) 96666-4321', location: { mode: 'delivery', address: { cep: '05407-002', street: 'Rua Cardeal Arcoverde', number: '450', district: 'Pinheiros', complement: 'Casa 2' } }, items: [line('Spaghetti à Bolonhesa', 2), line('Refrigerante Lata', 2)], notes: 'Uma das massas sem parmesão', payment: { method: 'dinheiro', changeFor: 150, status: 'pendente' }, status: 'preparo', ago: 15 },
    { customerName: 'Camila', phone: '', location: mesa(5), items: [line('Pratello Burger Clássico', 1), line('Suco de Laranja Natural', 1), line('Sorvete Artesanal', 1)], notes: 'Hambúrguer bem passado', payment: { method: 'pix', status: 'pendente' }, status: 'pendente', ago: 6 },
    { customerName: 'Gustavo', phone: '', location: mesa(3), items: [line('Yakisoba de Legumes', 1), line('Guioza (6 un.)', 1)], notes: '', payment: { method: 'cartao', cardType: 'credito', needsMachine: false, status: 'pendente' }, status: 'pendente', ago: 2 },
  ];

  return raw.map(({ ago, ...o }, i) => {
    const createdAt = now - ago * 60_000;
    const subtotal = o.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const deliveryFee = o.location.mode === 'delivery' && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
    return {
      ...o,
      id: `o${i + 1}`,
      number: 101 + i,
      clientId: `seed-${i + 1}`,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      createdAt,
      updatedAt: createdAt,
    };
  });
}
```


## `src/pages/Admin.tsx`

```tsx
import { ClipboardList, LayoutDashboard, LogOut, RotateCcw, Users, UtensilsCrossed } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/cardapio', label: 'Gerenciar Cardápio', icon: UtensilsCrossed, end: false },
  { to: '/admin/funcionarios', label: 'Funcionários', icon: Users, end: false },
  { to: '/pedidos', label: 'Painel de Pedidos', icon: ClipboardList, end: false },
];

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
    isActive ? 'bg-yellow-400 text-zinc-900' : 'text-zinc-300 hover:bg-zinc-700/60 hover:text-white'
  }`;

export default function Admin() {
  const { session, logout, resetDemoData } = useApp();

  const reset = () => {
    if (confirm('Restaurar cardápio, pedidos e funcionários para os dados de demonstração?')) resetDemoData();
  };

  return (
    <div className="min-h-screen bg-zinc-100 lg:flex">
      {/* Sidebar desktop / topo mobile */}
      <aside className="sticky top-0 z-30 bg-zinc-800 lg:h-screen lg:w-64 lg:shrink-0">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-6">
          <Logo light />
          <button onClick={logout} className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-700 lg:hidden" aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkCls}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden space-y-1 border-t border-zinc-700 p-3 lg:block">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-white">{session?.name}</p>
            <p className="text-xs text-zinc-400">Administrador</p>
          </div>
          <button onClick={reset} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700/60 hover:text-white">
            <RotateCcw size={16} /> Restaurar dados demo
          </button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700/60 hover:text-white">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
        <button onClick={reset} className="mt-10 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 lg:hidden">
          <RotateCcw size={14} /> Restaurar dados demo
        </button>
      </main>
    </div>
  );
}
```


## `src/pages/Login.tsx`

```tsx
import { ChefHat, KeyRound, LogIn, Star, User, UtensilsCrossed } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationForm, { draftToLocation, toDraft, type LocationDraft } from '../components/LocationForm';
import Logo from '../components/Logo';
import { Button, Field, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import { LOGIN_HERO_IMAGE } from '../data/mockData';

type Tab = 'cliente' | 'equipe';

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const DEMO_CREDENTIALS = [
  { label: 'Administrador', login: 'admin@pratello.com', password: '1234' },
  { label: 'Cozinha', login: 'cozinha@pratello.com', password: '1234' },
];

export default function Login() {
  const { loginClient, loginStaff } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('cliente');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<LocationDraft>(toDraft());
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
  };

  const submitClient = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Informe seu nome.');
    const loc = draftToLocation(location);
    if (typeof loc === 'string') return setError(loc);
    if (loc.mode === 'delivery' && phone.replace(/\D/g, '').length < 10) return setError('Informe um telefone para contato da entrega.');
    loginClient(name, phone, loc);
    navigate('/cardapio');
  };

  const submitStaff = (e: FormEvent) => {
    e.preventDefault();
    const user = loginStaff(login, password);
    if (!user) return setError('Usuário ou senha inválidos.');
    navigate(user.role === 'admin' ? '/admin' : '/pedidos');
  };

  return (
    <div className="grid min-h-screen bg-zinc-100 lg:grid-cols-2">
      {/* Coluna da imagem */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={LOGIN_HERO_IMAGE} alt="Mesa com pratos variados" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-zinc-900/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div className="max-w-md">
            <div className="mb-4 flex gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
              Sabor de verdade, <span className="text-yellow-400">direto na sua mesa.</span>
            </h1>
            <p className="mt-4 text-lg text-zinc-300">
              Escolha, peça e acompanhe seu pedido sem esperar pelo garçom.
            </p>
          </div>
        </div>
      </aside>

      {/* Coluna do formulário */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900">Bem-vindo ao Pratello</h2>
          <p className="mt-1 text-zinc-600">Acesse o cardápio ou entre na área da equipe.</p>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-zinc-200/70 p-1" role="tablist">
            {(
              [
                ['cliente', 'Cliente', User],
                ['equipe', 'Equipe', ChefHat],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => switchTab(id)}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  tab === id ? 'bg-yellow-400 text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            {tab === 'cliente' ? (
              <form onSubmit={submitClient} className="space-y-4">
                <Field label="Nome">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" />
                </Field>
                <Field label={location.mode === 'delivery' ? 'Telefone' : 'Telefone (opcional)'}>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-0000" autoComplete="tel" />
                </Field>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-zinc-700">Onde você está?</span>
                  <LocationForm
                    value={location}
                    onChange={(d) => {
                      setLocation(d);
                      setError('');
                    }}
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                <Button type="submit" size="lg" className="w-full">
                  <UtensilsCrossed size={18} /> Acessar Cardápio
                </Button>
                <p className="text-center text-xs text-zinc-500">Não é preciso senha para fazer pedidos.</p>
              </form>
            ) : (
              <form onSubmit={submitStaff} className="space-y-4">
                <Field label="Usuário / E-mail">
                  <Input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="seu@pratello.com" autoComplete="username" />
                </Field>
                <Field label="Senha">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" autoComplete="current-password" />
                </Field>
                {error && <p className="text-sm font-medium text-red-600">{error}</p>}
                <Button type="submit" size="lg" className="w-full">
                  <LogIn size={18} /> Entrar
                </Button>

                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    <KeyRound size={14} /> Credenciais de teste
                  </p>
                  <div className="space-y-2">
                    {DEMO_CREDENTIALS.map((c) => (
                      <button
                        type="button"
                        key={c.login}
                        onClick={() => {
                          setLogin(c.login);
                          setPassword(c.password);
                          setError('');
                        }}
                        className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm ring-1 ring-zinc-200 hover:ring-yellow-400"
                      >
                        <span className="font-medium text-zinc-800">{c.label}</span>
                        <code className="text-xs text-zinc-600">
                          {c.login} / {c.password}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```


## `src/pages/Menu.tsx`

```tsx
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
```


## `src/pages/Orders.tsx`

```tsx
import { CheckCheck, ChefHat, Clock3, Inbox, LayoutDashboard, LogOut, PackageCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import OrderCard from '../components/OrderCard';
import { useApp } from '../context/AppContext';
import type { OrderStatus } from '../types';
import { STATUS_FLOW, STATUS_LABEL, isToday } from '../utils/format';

const COLUMN_META: Record<OrderStatus, { icon: typeof Inbox; accent: string }> = {
  pendente: { icon: Inbox, accent: 'bg-zinc-400' },
  preparo: { icon: ChefHat, accent: 'bg-yellow-400' },
  pronto: { icon: PackageCheck, accent: 'bg-green-500' },
  entregue: { icon: CheckCheck, accent: 'bg-zinc-800' },
};

export default function Orders() {
  const { orders, advanceOrder, markOrderPaid, session, logout } = useApp();
  const [mobileTab, setMobileTab] = useState<OrderStatus>('pendente');
  const [, setTick] = useState(0);

  // Atualiza o tempo de espera exibido a cada 30s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const columns = useMemo(() => {
    const byStatus = Object.fromEntries(STATUS_FLOW.map((s) => [s, [] as typeof orders])) as Record<OrderStatus, typeof orders>;
    for (const o of orders) byStatus[o.status].push(o);
    STATUS_FLOW.forEach((s) => byStatus[s].sort((a, b) => a.createdAt - b.createdAt));
    // Entregues: apenas os de hoje, mais recentes primeiro
    byStatus.entregue = byStatus.entregue.filter((o) => isToday(o.updatedAt)).sort((a, b) => b.updatedAt - a.updatedAt);
    return byStatus;
  }, [orders]);

  const isAdmin = session?.type === 'staff' && session.role === 'admin';

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6">
          <Logo light />
          <span className="hidden rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-yellow-400 sm:inline">Painel da Cozinha</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-zinc-300 md:inline">{session?.name}</span>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
                <LayoutDashboard size={16} /> <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Pedidos</h1>
            <p className="flex items-center gap-1.5 text-sm text-zinc-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Atualização em tempo real
            </p>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-zinc-600">
            <Clock3 size={16} /> {columns.pendente.length + columns.preparo.length} pedido(s) em aberto
          </p>
        </div>

        {/* Abas no mobile */}
        <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => setMobileTab(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                mobileTab === s ? 'bg-yellow-400 text-zinc-900' : 'border border-zinc-200 bg-white text-zinc-600'
              }`}
            >
              {STATUS_LABEL[s]} ({columns[s].length})
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUS_FLOW.map((status) => {
            const { icon: Icon, accent } = COLUMN_META[status];
            return (
              <section
                key={status}
                className={`flex flex-col rounded-2xl bg-zinc-200/60 p-3 ${mobileTab === status ? '' : 'hidden md:flex'}`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 font-bold text-zinc-900">
                    <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
                    <Icon size={16} /> {STATUS_LABEL[status]}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-zinc-700">{columns[status].length}</span>
                </div>
                <div className="space-y-3 xl:max-h-[calc(100vh-15rem)] xl:overflow-y-auto">
                  {columns[status].length === 0 ? (
                    <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">Nenhum pedido</p>
                  ) : (
                    columns[status].map((o) => <OrderCard key={o.id} order={o} onAdvance={() => advanceOrder(o.id)} onMarkPaid={() => markOrderPaid(o.id)} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
```


## `src/utils/format.ts`

```ts
import type { OrderStatus, Payment, ServiceLocation } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPrice = (value: number) => brl.format(value);

/** Converte "29,90" / "1.234,50" / "29.9" em número. */
export const parsePrice = (raw: string) => {
  const s = raw.trim();
  if (!s) return NaN;
  return Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s);
};

export const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const minutesSince = (timestamp: number) => Math.max(0, Math.floor((Date.now() - timestamp) / 60000));

export const isToday = (timestamp: number) => new Date(timestamp).toDateString() === new Date().toDateString();

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const discountPercent = (price: number, original?: number) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

export const prepRange = (minutes: number) => `${minutes}-${minutes + 10} min`;

/* ---------- Localização ---------- */

export function formatLocation(loc: ServiceLocation): string {
  if (loc.mode === 'mesa') return `Mesa ${loc.table}`;
  const a = loc.address;
  return `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''}`;
}

export function formatLocationFull(loc: ServiceLocation): string {
  if (loc.mode === 'mesa') return `Mesa ${loc.table}`;
  const a = loc.address;
  return `${formatLocation(loc)} · ${a.district} · CEP ${a.cep}`;
}

/* ---------- Pagamento ---------- */

export const PAYMENT_LABEL = { cartao: 'Cartão', pix: 'Pix', dinheiro: 'Dinheiro' } as const;

export function formatPayment(p: Payment): string {
  if (p.method === 'cartao') {
    const type = p.cardType === 'debito' ? 'Débito' : 'Crédito';
    return `Cartão de ${type}${p.needsMachine ? ' · levar maquininha' : ''}`;
  }
  if (p.method === 'dinheiro') return p.changeFor ? `Dinheiro · troco para ${formatPrice(p.changeFor)}` : 'Dinheiro · sem troco';
  return 'Pix';
}

/* ---------- Status dos pedidos ---------- */

export const STATUS_FLOW: OrderStatus[] = ['pendente', 'preparo', 'pronto', 'entregue'];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: 'Pendente',
  preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue',
};

export const NEXT_ACTION_LABEL: Record<OrderStatus, string | null> = {
  pendente: 'Iniciar preparo',
  preparo: 'Marcar como pronto',
  pronto: 'Marcar como entregue',
  entregue: null,
};
```


## `src/utils/routes.ts`

```ts
import type { Session } from '../types';

/** Rota inicial de cada perfil. */
export function homeFor(session: Session | null) {
  if (!session) return '/';
  if (session.type === 'cliente') return '/cardapio';
  return session.role === 'admin' ? '/admin' : '/pedidos';
}
```


## `src/pages/admin/Dashboard.tsx`

```tsx
import { DollarSign, Receipt, ShoppingBag, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { StatusBadge } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { formatPrice, formatTime, isToday } from '../../utils/format';

export default function Dashboard() {
  const { orders, products, categories } = useApp();

  const stats = useMemo(() => {
    const today = orders.filter((o) => isToday(o.createdAt));
    const revenue = today.reduce((s, o) => s + o.total, 0);

    const qtyByProduct = new Map<string, { name: string; qty: number }>();
    const revenueByCategory = new Map<string, number>();
    for (const o of today) {
      for (const it of o.items) {
        const cur = qtyByProduct.get(it.productId) ?? { name: it.name, qty: 0 };
        cur.qty += it.quantity;
        qtyByProduct.set(it.productId, cur);
        const cat = products.find((p) => p.id === it.productId)?.category ?? 'outros';
        revenueByCategory.set(cat, (revenueByCategory.get(cat) ?? 0) + it.price * it.quantity);
      }
    }
    const ranking = [...qtyByProduct.values()].sort((a, b) => b.qty - a.qty);
    return {
      today,
      revenue,
      count: today.length,
      ticket: today.length ? revenue / today.length : 0,
      top: ranking[0],
      ranking: ranking.slice(0, 5),
      revenueByCategory,
    };
  }, [orders, products]);

  const cards = [
    { label: 'Faturamento do dia', value: formatPrice(stats.revenue), icon: DollarSign },
    { label: 'Total de pedidos', value: String(stats.count), icon: ShoppingBag },
    { label: 'Ticket médio', value: formatPrice(stats.ticket), icon: Receipt },
    { label: 'Prato mais vendido', value: stats.top?.name ?? '—', sub: stats.top ? `${stats.top.qty} unidades` : undefined, icon: Trophy },
  ];

  const maxRank = stats.ranking[0]?.qty ?? 1;
  const maxCat = Math.max(1, ...stats.revenueByCategory.values());

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
      <p className="text-sm text-zinc-600">Resumo das vendas de hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600">{label}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-zinc-900">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 truncate text-2xl font-extrabold text-zinc-900" title={value}>
              {value}
            </p>
            {sub && <p className="text-xs text-zinc-500">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-900">Mais vendidos hoje</h2>
          <ul className="mt-4 space-y-3">
            {stats.ranking.length === 0 && <li className="text-sm text-zinc-500">Sem vendas ainda.</li>}
            {stats.ranking.map((r) => (
              <li key={r.name}>
                <div className="flex justify-between text-sm">
                  <span className="truncate text-zinc-700">{r.name}</span>
                  <span className="font-semibold text-zinc-900">{r.qty}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-100">
                  <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${(r.qty / maxRank) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-900">Faturamento por categoria</h2>
          <ul className="mt-4 space-y-3">
            {categories.map((c) => {
              const v = stats.revenueByCategory.get(c.id) ?? 0;
              return (
                <li key={c.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-700">{c.name}</span>
                    <span className="font-semibold text-zinc-900">{formatPrice(v)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-800" style={{ width: `${(v / maxCat) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-zinc-900">Últimos pedidos</h2>
          <ul className="mt-4 divide-y divide-zinc-100">
            {[...stats.today]
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 6)
              .map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900">
                      #{o.number} · <span className="font-normal text-zinc-600">{o.customerName}</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatTime(o.createdAt)} · {formatPrice(o.total)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
```


## `src/pages/admin/MenuManager.tsx`

```tsx
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import Modal from '../../components/Modal';
import ProductImage from '../../components/ProductImage';
import { Button, Field, Input, Select, Textarea } from '../../components/ui';
import { useApp, type ProductInput } from '../../context/AppContext';
import type { CategoryId, Product, TagId } from '../../types';
import { discountPercent, formatPrice, parsePrice } from '../../utils/format';

interface FormState {
  id?: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  prepTime: string;
  category: CategoryId;
  tags: TagId[];
  image: string;
  ingredients: string;
  available: boolean;
  popular: boolean;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  prepTime: '20',
  category: 'lanches',
  tags: [],
  image: '',
  ingredients: '',
  available: true,
  popular: false,
};

const money = (v?: number) => (v ? v.toFixed(2).replace('.', ',') : '');

const toForm = (p: Product): FormState => ({
  ...p,
  price: money(p.price),
  originalPrice: money(p.originalPrice),
  prepTime: String(p.prepTime),
  ingredients: p.ingredients.join(', '),
});

export default function MenuManager() {
  const { products, categories, visualCategories, saveProduct, deleteProduct, toggleProductAvailability } = useApp();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'todas' | CategoryId>('todas');

  const list = useMemo(
    () =>
      products.filter(
        (p) => (cat === 'todas' || p.category === cat) && p.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, cat, query],
  );

  const catName = (id: CategoryId) => categories.find((c) => c.id === id)?.name ?? id;

  const open = (p?: Product) => {
    setError('');
    setForm(p ? toForm(p) : { ...emptyForm });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const price = parsePrice(form.price);
    const original = form.originalPrice.trim() ? parsePrice(form.originalPrice) : undefined;
    const prepTime = Number(form.prepTime);
    if (!form.name.trim()) return setError('Informe o nome do prato.');
    if (!Number.isFinite(price) || price <= 0) return setError('Informe um preço válido (ex: 29,90).');
    if (original !== undefined && (!Number.isFinite(original) || original <= price))
      return setError('O preço "de" (promoção) deve ser maior que o preço atual.');
    if (!Number.isInteger(prepTime) || prepTime <= 0) return setError('Informe o tempo de preparo em minutos.');
    const input: ProductInput = {
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Math.round(price * 100) / 100,
      originalPrice: original !== undefined ? Math.round(original * 100) / 100 : undefined,
      prepTime,
      tags: form.tags,
      category: form.category,
      image: form.image.trim(),
      ingredients: form.ingredients
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      available: form.available,
      popular: form.popular,
    };
    saveProduct(input);
    setForm(null);
  };

  const remove = (p: Product) => {
    if (confirm(`Excluir "${p.name}" do cardápio?`)) deleteProduct(p.id);
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gerenciar Cardápio</h1>
          <p className="text-sm text-zinc-600">
            {products.length} pratos · {products.filter((p) => p.available).length} disponíveis
          </p>
        </div>
        <Button onClick={() => open()}>
          <Plus size={18} /> Novo prato
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar prato…" className="pl-9" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} className="sm:w-56">
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {list.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">Nenhum prato encontrado.</p>}
        <ul className="divide-y divide-zinc-100">
          {list.map((p) => (
            <li key={p.id} className={`flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap ${p.available ? '' : 'bg-zinc-50'}`}>
              <ProductImage src={p.image} alt={p.name} className={`h-16 w-16 shrink-0 rounded-xl ${p.available ? '' : 'opacity-50 grayscale'}`} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold text-zinc-900">
                  <span className="truncate">{p.name}</span>
                  {p.popular && <span className="shrink-0 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold uppercase">Destaque</span>}
                  {discountPercent(p.price, p.originalPrice) > 0 && (
                    <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-400">-{discountPercent(p.price, p.originalPrice)}%</span>
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  {catName(p.category)} · <b className="text-zinc-800">{formatPrice(p.price)}</b>
                </p>
              </div>
              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                  <button
                    role="switch"
                    aria-checked={p.available}
                    onClick={() => toggleProductAvailability(p.id)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${p.available ? 'bg-yellow-400' : 'bg-zinc-300'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.available ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                  <span className="w-20">{p.available ? 'Disponível' : 'Indisponível'}</span>
                </label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => open(p)} aria-label={`Editar ${p.name}`}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(p)} aria-label={`Excluir ${p.name}`}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={!!form} title={form?.id ? 'Editar prato' : 'Novo prato'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Nome">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </Field>
            <Field label="Descrição">
              <Textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (R$)">
                <Input inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="29,90" />
              </Field>
              <Field label="Categoria">
                <Select value={form.category} onChange={(e) => set('category', e.target.value as CategoryId)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço “de” (opcional)" hint="Preencha para mostrar como promoção.">
                <Input inputMode="decimal" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="34,90" />
              </Field>
              <Field label="Preparo (min)">
                <Input inputMode="numeric" value={form.prepTime} onChange={(e) => set('prepTime', e.target.value.replace(/\D/g, ''))} />
              </Field>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-zinc-700">Categorias da vitrine</span>
              <div className="flex flex-wrap gap-1.5">
                {visualCategories.map((c) => {
                  const on = form.tags.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => set('tags', on ? form.tags.filter((t) => t !== c.id) : [...form.tags, c.id])}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        on ? 'bg-yellow-400 text-zinc-900 ring-yellow-400' : 'bg-white text-zinc-600 ring-zinc-200 hover:ring-zinc-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="URL da imagem">
              <div className="flex gap-3">
                <Input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…" />
                <ProductImage src={form.image} alt="Prévia" className="h-11 w-11 shrink-0 rounded-lg" />
              </div>
            </Field>
            <Field label="Ingredientes" hint="Separados por vírgula — usados na busca do cliente.">
              <Input value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} placeholder="queijo, tomate, manjericão" />
            </Field>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} className="h-4 w-4 accent-yellow-400" />
                Disponível
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={form.popular} onChange={(e) => set('popular', e.target.checked)} className="h-4 w-4 accent-yellow-400" />
                Mais pedido (destaque)
              </label>
            </div>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setForm(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
```


## `src/pages/admin/StaffManager.tsx`

```tsx
import { Pencil, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Modal from '../../components/Modal';
import { Button, Field, Input, Select } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import type { Role, StaffUser } from '../../types';

interface FormState {
  id?: string;
  name: string;
  role: Role;
  login: string;
  password: string;
}

const ROLE_LABEL: Record<Role, string> = { admin: 'Administrador', funcionario: 'Funcionário' };

export default function StaffManager() {
  const { users, saveUser, deleteUser, session } = useApp();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');

  const myId = session?.type === 'staff' ? session.userId : '';

  const open = (u?: StaffUser) => {
    setError('');
    setForm(u ? { ...u } : { name: '', role: 'funcionario', login: '', password: '' });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.login.trim() || !form.password) return setError('Preencha todos os campos.');
    const err = saveUser({ ...form, name: form.name.trim() });
    if (err) return setError(err);
    setForm(null);
  };

  const remove = (u: StaffUser) => {
    setListError('');
    if (!confirm(`Excluir o acesso de ${u.name}?`)) return;
    const err = deleteUser(u.id);
    if (err) setListError(err);
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gerenciar Funcionários</h1>
          <p className="text-sm text-zinc-600">{users.length} pessoas com acesso à área da equipe</p>
        </div>
        <Button onClick={() => open()}>
          <Plus size={18} /> Novo funcionário
        </Button>
      </div>

      {listError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{listError}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((u) => (
          <article key={u.id} className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                  u.role === 'admin' ? 'bg-zinc-800 text-yellow-400' : 'bg-yellow-400 text-zinc-900'
                }`}
              >
                {u.role === 'admin' ? <ShieldCheck size={20} /> : <UserRound size={20} />}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-900">
                  {u.name} {u.id === myId && <span className="text-xs font-normal text-zinc-500">(você)</span>}
                </p>
                <p className="text-sm text-zinc-600">{ROLE_LABEL[u.role]}</p>
              </div>
            </div>
            <p className="mt-4 truncate rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-700">{u.login}</p>
            <div className="mt-4 flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => open(u)}>
                <Pencil size={16} /> Editar
              </Button>
              <Button variant="danger" size="sm" onClick={() => remove(u)} disabled={u.id === myId}>
                <Trash2 size={16} /> Excluir
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Modal open={!!form} title={form?.id ? 'Editar funcionário' : 'Novo funcionário'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Nome">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </Field>
            <Field label="Cargo">
              <Select value={form.role} onChange={(e) => set('role', e.target.value as Role)}>
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
            <Field label="Login (usuário ou e-mail)">
              <Input value={form.login} onChange={(e) => set('login', e.target.value)} placeholder="nome@pratello.com" autoComplete="off" />
            </Field>
            <Field label="Senha">
              <Input value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
            </Field>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setForm(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
```
