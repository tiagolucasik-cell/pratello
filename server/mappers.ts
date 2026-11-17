import type { Order, Product, StaffUser } from '../src/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export const PRODUCT_COLUMNS =
  'id, name, description, price, original_price, category, tags, prep_time, image, available, popular, ingredients';

export function rowToProduct(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    ...(r.original_price !== null ? { originalPrice: r.original_price } : {}),
    category: r.category,
    tags: r.tags,
    prepTime: r.prep_time,
    image: r.image,
    available: r.available,
    popular: r.popular,
    ingredients: r.ingredients,
  };
}

export function rowToUser(r: Row): StaffUser {
  return { id: r.id, name: r.name, role: r.role, login: r.login };
}

/** SELECT de pedidos já com os itens agregados em JSON. */
export const ORDER_SELECT = `
  SELECT o.*,
         COALESCE(
           json_agg(json_build_object('productId', i.product_id, 'name', i.name, 'price', i.unit_price, 'quantity', i.quantity) ORDER BY i.id)
             FILTER (WHERE i.id IS NOT NULL),
           '[]'
         ) AS items
    FROM orders o
    LEFT JOIN order_items i ON i.order_id = o.id`;

export function rowToOrder(r: Row): Order {
  return {
    id: r.id,
    number: r.number,
    clientId: r.client_id,
    customerName: r.customer_name,
    phone: r.phone,
    location:
      r.location_mode === 'mesa'
        ? { mode: 'mesa', table: r.table_number }
        : {
            mode: 'delivery',
            address: { cep: r.cep, street: r.street, number: r.address_number, district: r.district, complement: r.complement ?? '' },
          },
    items: (r.items as Row[]).map((i) => ({ productId: i.productId ?? '', name: i.name, price: Number(i.price), quantity: i.quantity })),
    notes: r.notes,
    subtotal: r.subtotal,
    deliveryFee: r.delivery_fee,
    total: r.total,
    payment: {
      method: r.payment_method,
      ...(r.card_type ? { cardType: r.card_type } : {}),
      ...(r.needs_machine !== null ? { needsMachine: r.needs_machine } : {}),
      ...(r.change_for !== null ? { changeFor: r.change_for } : {}),
      status: r.payment_status,
    },
    status: r.status,
    createdAt: (r.created_at as Date).getTime(),
    updatedAt: (r.updated_at as Date).getTime(),
  };
}
