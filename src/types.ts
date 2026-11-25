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
  /** Parcelas no crédito (1 = à vista). */
  installments?: number;
  status: 'pendente' | 'pago';
}

/** Por onde o pedido chegou: pelo app (mesa/delivery) ou enviado pelo WhatsApp. */
export type OrderChannel = 'app' | 'whatsapp';

export type ShippingId = 'padrao' | 'expressa';

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
  /** Frete já com o desconto de cupom de frete aplicado. */
  deliveryFee: number;
  /** Desconto de cupom no valor dos produtos. */
  discount?: number;
  coupons?: string[];
  channel?: OrderChannel;
  shipping?: ShippingId;
  total: number;
  payment: Payment;
  status: OrderStatus;
  /** Código de 4 dígitos que o cliente informa ao entregador (só delivery). */
  deliveryCode?: string;
  /** Avaliação do cliente (1 a 5 estrelas) depois da entrega. */
  rating?: number;
  ratedAt?: number;
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
