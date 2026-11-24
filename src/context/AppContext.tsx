import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, categories, createSeedOrders, seedProducts, seedUsers, visualCategories } from '../data/mockData';
import type { CartItem, Category, Order, OrderChannel, Payment, Product, ServiceLocation, Session, ShippingId, StaffUser, VisualCategory } from '../types';
import { computeCheckout, type CheckoutSummary } from '../utils/checkout';
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

/**
 * Identidade do cliente que se mantém entre logins, para ele voltar e ver os pedidos:
 * pelo telefone (vale em qualquer aba) ou, sem telefone, pelo nome neste navegador.
 */
function clientIdFor(name: string, phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) return `c-tel-${digits}`;
  let device = '';
  try {
    device = localStorage.getItem('pratello:v2:device') ?? '';
    if (!device) {
      device = uid('d');
      localStorage.setItem('pratello:v2:device', device);
    }
  } catch {
    return uid('c');
  }
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
  return `c-${device}-${slug}`;
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

/** Tudo que a tela de pagamento coleta. Os valores (frete, descontos, total) são recalculados aqui. */
export interface CheckoutDetails {
  location: ServiceLocation;
  channel: OrderChannel;
  phone: string;
  notes: string;
  payment: PaymentInput;
  shipping: ShippingId;
  couponCodes: string[];
}

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
  placeOrder: (details: CheckoutDetails) => Order | null;

  advanceOrder: (orderId: string) => void;
  markOrderPaid: (orderId: string) => void;
  rateOrder: (orderId: string, rating: number) => void;

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
      setSession({ type: 'cliente', clientId: clientIdFor(name, phone), name: name.trim(), phone: phone.trim(), location });
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
  const subtotal = Math.round(cartLines.reduce((s, l) => s + l.quantity * l.product.price, 0) * 100) / 100;
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
    ({ location, channel, phone, notes, payment: { pixPaid, ...payment }, shipping, couponCodes }: CheckoutDetails) => {
      if (session?.type !== 'cliente' || cartLines.length === 0) return null;
      const summary: CheckoutSummary = computeCheckout({
        subtotal,
        mode: channel === 'whatsapp' ? 'whatsapp' : location.mode,
        payment: payment.method,
        cep: location.mode === 'delivery' ? location.address.cep : '',
        shipping,
        couponCodes,
      });
      const now = Date.now();
      const order: Order = {
        id: uid('o'),
        number: orders.reduce((max, o) => Math.max(max, o.number), 100) + 1,
        clientId: session.clientId,
        customerName: session.name,
        phone: phone.trim(),
        location,
        items: cartLines.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        notes: notes.trim(),
        subtotal,
        deliveryFee: Math.round((summary.shippingFee - summary.shippingDiscount) * 100) / 100,
        discount: summary.discount,
        coupons: summary.applied.map((c) => c.code),
        channel,
        shipping: location.mode === 'delivery' ? shipping : undefined,
        total: summary.total,
        payment: { ...payment, status: payment.method === 'pix' && pixPaid ? 'pago' : 'pendente' },
        status: 'pendente',
        createdAt: now,
        updatedAt: now,
      };
      setOrders((prev) => [...prev, order]);
      setSession({ ...session, location, phone: phone.trim() || session.phone });
      setCart([]);
      return order;
    },
    [session, cartLines, subtotal, orders, setOrders, setCart, setSession],
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

  const rateOrder = useCallback(
    (orderId: string, rating: number) =>
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, rating: Math.min(5, Math.max(1, Math.round(rating))), ratedAt: Date.now() } : o))),
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
    rateOrder,
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
