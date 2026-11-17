import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, categories, visualCategories } from '../data/mockData';
import type { CartItem, Category, Order, Payment, Product, ServiceLocation, Session, StaffUser, VisualCategory } from '../types';
import { ApiError, OFFLINE_MESSAGE, api, errorMessage, setApiToken } from '../utils/api';
import { uid } from '../utils/format';

/*
 * Os dados (cardápio, pedidos, funcionários) ficam no PostgreSQL e são acessados pela API.
 * No navegador ficam só o login e o carrinho, por aba (sessionStorage).
 */

const KEYS = { session: 'pratello:v3:session', cart: 'pratello:v3:cart' } as const;

const POLL = { orders: 3000, myOrders: 4000, products: 10000 };

function useTabState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      if (state === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* armazenamento indisponível */
    }
  }, [key, state]);
  return [state, setState] as const;
}

/** Executa `fn` agora e a cada `ms` enquanto `enabled` for verdadeiro. */
function usePolling(fn: () => Promise<void>, ms: number, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    fn();
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }, [fn, ms, enabled]);
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export type ProductInput = Omit<Product, 'id'> & { id?: string };
export type UserInput = Omit<StaffUser, 'id'> & { id?: string; password: string };
export type PaymentInput = Omit<Payment, 'status'> & { pixPaid?: boolean };

/** Ações que podem falhar devolvem a mensagem de erro (ou null em caso de sucesso). */
type Result = Promise<string | null>;

interface AppContextValue {
  categories: Category[];
  visualCategories: VisualCategory[];
  products: Product[];
  users: StaffUser[];
  orders: Order[];
  myOrders: Order[];
  session: Session | null;
  connectionError: string | null;

  loginClient: (name: string, phone: string, location: ServiceLocation) => void;
  updateLocation: (location: ServiceLocation) => void;
  loginStaff: (login: string, password: string) => Promise<StaffUser | string>;
  logout: () => void;

  cartLines: CartLine[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number) => void;
  changeQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: (notes: string, payment: PaymentInput) => Promise<Order | string>;

  advanceOrder: (orderId: string) => Result;
  markOrderPaid: (orderId: string) => Result;

  saveProduct: (input: ProductInput) => Result;
  deleteProduct: (id: string) => Result;
  toggleProductAvailability: (id: string) => Result;

  saveUser: (input: UserInput) => Result;
  deleteUser: (id: string) => Result;

  resetDemoData: () => Result;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useTabState<Session | null>(KEYS.session, null);
  const [cart, setCart] = useTabState<CartItem[]>(KEYS.cart, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // o token precisa estar disponível já na primeira requisição desta renderização
  setApiToken(session?.type === 'staff' ? session.token : null);

  const isStaff = session?.type === 'staff';
  const isAdmin = isStaff && session.role === 'admin';
  const clientId = session?.type === 'cliente' ? session.clientId : null;

  /** Envolve chamadas à API: marca a conexão, encerra sessão expirada e devolve erro amigável. */
  const call = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> => {
      try {
        const data = await fn();
        setConnectionError(null);
        return { ok: true, data };
      } catch (e) {
        if (e instanceof ApiError && e.status === 0) setConnectionError(OFFLINE_MESSAGE);
        if (e instanceof ApiError && e.status === 401 && session?.type === 'staff') setSession(null);
        return { ok: false, error: errorMessage(e) };
      }
    },
    [session, setSession],
  );

  /* ---------- Carregamento + atualização em tempo real (polling) ---------- */

  const loadProducts = useCallback(async () => {
    const r = await call(() => api<Product[]>('/products'));
    if (r.ok) setProducts(r.data);
  }, [call]);

  const loadOrders = useCallback(async () => {
    const r = await call(() => api<Order[]>('/orders'));
    if (r.ok) setOrders(r.data);
  }, [call]);

  const loadMyOrders = useCallback(async () => {
    if (!clientId) return;
    const r = await call(() => api<Order[]>(`/orders/client/${encodeURIComponent(clientId)}`));
    if (r.ok) setMyOrders(r.data);
  }, [call, clientId]);

  const loadUsers = useCallback(async () => {
    const r = await call(() => api<StaffUser[]>('/users'));
    if (r.ok) setUsers(r.data);
  }, [call]);

  usePolling(loadProducts, POLL.products, !!session);
  usePolling(loadOrders, POLL.orders, isStaff);
  usePolling(loadMyOrders, POLL.myOrders, !!clientId);
  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);

  // limpa dados sensíveis ao sair
  useEffect(() => {
    if (!isStaff) {
      setOrders([]);
      setUsers([]);
    }
    if (!clientId) setMyOrders([]);
  }, [isStaff, clientId]);

  /* ---------- Autenticação ---------- */

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
    async (login: string, password: string) => {
      const r = await call(() => api<{ token: string; user: StaffUser }>('/auth/login', { method: 'POST', body: { login, password } }));
      if (!r.ok) return r.error;
      const { token, user } = r.data;
      setApiToken(token);
      setSession({ type: 'staff', userId: user.id, name: user.name, role: user.role, token });
      return user;
    },
    [call, setSession],
  );

  const logout = useCallback(() => {
    setSession(null);
    setCart([]);
  }, [setSession, setCart]);

  /* ---------- Carrinho (local) ---------- */

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
        prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + delta } : c)).filter((c) => c.quantity > 0),
      ),
    [setCart],
  );

  const removeFromCart = useCallback(
    (productId: string) => setCart((prev) => prev.filter((c) => c.productId !== productId)),
    [setCart],
  );

  const placeOrder = useCallback(
    async (notes: string, payment: PaymentInput) => {
      if (session?.type !== 'cliente' || cartLines.length === 0) return 'Carrinho vazio.';
      const r = await call(() =>
        api<Order>('/orders', {
          method: 'POST',
          body: {
            clientId: session.clientId,
            customerName: session.name,
            phone: session.phone,
            location: session.location,
            items: cartLines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
            notes,
            payment,
          },
        }),
      );
      if (!r.ok) {
        loadProducts(); // ex.: um prato ficou indisponível
        return r.error;
      }
      setCart([]);
      setMyOrders((prev) => [...prev, r.data]);
      return r.data;
    },
    [session, cartLines, call, setCart, loadProducts],
  );

  /* ---------- Pedidos (equipe) ---------- */

  const mutateOrder = useCallback(
    async (path: string) => {
      const r = await call(() => api<Order>(path, { method: 'PATCH' }));
      if (!r.ok) return r.error;
      setOrders((prev) => prev.map((o) => (o.id === r.data.id ? r.data : o)));
      return null;
    },
    [call],
  );

  const advanceOrder = useCallback((id: string) => mutateOrder(`/orders/${id}/advance`), [mutateOrder]);
  const markOrderPaid = useCallback((id: string) => mutateOrder(`/orders/${id}/pay`), [mutateOrder]);

  /* ---------- Cardápio (admin) ---------- */

  const saveProduct = useCallback(
    async ({ id, ...input }: ProductInput) => {
      const r = await call(() => api<Product>(id ? `/products/${id}` : '/products', { method: id ? 'PUT' : 'POST', body: input }));
      if (!r.ok) return r.error;
      setProducts((prev) => (id ? prev.map((p) => (p.id === id ? r.data : p)) : [...prev, r.data]));
      return null;
    },
    [call],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const r = await call(() => api<void>(`/products/${id}`, { method: 'DELETE' }));
      if (!r.ok) return r.error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return null;
    },
    [call],
  );

  const toggleProductAvailability = useCallback(
    async (id: string) => {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))); // otimista
      const r = await call(() => api<Product>(`/products/${id}/availability`, { method: 'PATCH' }));
      if (!r.ok) {
        loadProducts();
        return r.error;
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? r.data : p)));
      return null;
    },
    [call, loadProducts],
  );

  /* ---------- Funcionários (admin) ---------- */

  const saveUser = useCallback(
    async ({ id, ...input }: UserInput) => {
      const r = await call(() => api<StaffUser>(id ? `/users/${id}` : '/users', { method: id ? 'PUT' : 'POST', body: input }));
      if (!r.ok) return r.error;
      setUsers((prev) => (id ? prev.map((u) => (u.id === id ? r.data : u)) : [...prev, r.data]));
      if (session?.type === 'staff' && session.userId === r.data.id) setSession({ ...session, name: r.data.name, role: r.data.role });
      return null;
    },
    [call, session, setSession],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      const r = await call(() => api<void>(`/users/${id}`, { method: 'DELETE' }));
      if (!r.ok) return r.error;
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return null;
    },
    [call],
  );

  const resetDemoData = useCallback(async () => {
    const r = await call(() => api('/admin/reset', { method: 'POST' }));
    if (!r.ok) return r.error;
    await Promise.all([loadProducts(), loadOrders(), loadUsers()]);
    return null;
  }, [call, loadProducts, loadOrders, loadUsers]);

  const value: AppContextValue = {
    categories,
    visualCategories,
    products,
    users,
    orders,
    myOrders,
    session,
    connectionError,
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
