import bcrypt from 'bcryptjs';
import type pg from 'pg';
import { createSeedOrders, seedProducts, seedUsers } from '../src/data/mockData';
import type { Order } from '../src/types';

export async function insertProducts(client: pg.PoolClient) {
  for (const p of seedProducts) {
    await client.query(
      `INSERT INTO products (id, name, description, price, original_price, category, tags, prep_time, image, available, popular, ingredients)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [p.id, p.name, p.description, p.price, p.originalPrice ?? null, p.category, p.tags, p.prepTime, p.image, p.available, p.popular, p.ingredients],
    );
  }
}

/** Cria (ou restaura a senha de) os usuários de demonstração. */
export async function upsertSeedUsers(client: pg.PoolClient) {
  for (const u of seedUsers) {
    await client.query(
      `INSERT INTO staff_users (id, name, role, login, password_hash) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, login = EXCLUDED.login, password_hash = EXCLUDED.password_hash`,
      [u.id, u.name, u.role, u.login, await bcrypt.hash(u.password, 10)],
    );
  }
}

export async function insertOrder(client: pg.PoolClient, o: Omit<Order, 'number'> & { number?: number }) {
  const loc = o.location;
  const a = loc.mode === 'delivery' ? loc.address : null;
  const { rows } = await client.query(
    `INSERT INTO orders (id, ${o.number ? 'number, ' : ''}client_id, customer_name, phone, location_mode, table_number, cep, street, address_number, district, complement,
                         notes, subtotal, delivery_fee, total, payment_method, card_type, needs_machine, change_for, payment_status, status, created_at, updated_at)
     VALUES ($1, ${o.number ? `${Number(o.number)}, ` : ''}$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, to_timestamp($22 / 1000.0), to_timestamp($23 / 1000.0))
     RETURNING id`,
    [
      o.id, o.clientId, o.customerName, o.phone, loc.mode, loc.mode === 'mesa' ? loc.table : null,
      a?.cep ?? null, a?.street ?? null, a?.number ?? null, a?.district ?? null, a?.complement ?? null,
      o.notes, o.subtotal, o.deliveryFee, o.total,
      o.payment.method, o.payment.cardType ?? null, o.payment.needsMachine ?? null, o.payment.changeFor ?? null, o.payment.status,
      o.status, o.createdAt, o.updatedAt,
    ],
  );
  for (const it of o.items) {
    await client.query('INSERT INTO order_items (order_id, product_id, name, unit_price, quantity) VALUES ($1,$2,$3,$4,$5)', [
      rows[0].id, it.productId, it.name, it.price, it.quantity,
    ]);
  }
}

/** Apaga cardápio e pedidos e recria os dados de demonstração. Funcionários extras são mantidos. */
export async function resetDemo(client: pg.PoolClient) {
  await client.query('TRUNCATE order_items, orders, products RESTART IDENTITY CASCADE');
  await insertProducts(client);
  await upsertSeedUsers(client);
  for (const o of createSeedOrders()) await insertOrder(client, o);
  await client.query(`SELECT setval('order_number_seq', (SELECT COALESCE(MAX(number), 100) FROM orders))`);
}

/** Popula o banco apenas se estiver vazio (primeira execução). */
export async function seedIfEmpty(client: pg.PoolClient) {
  const { rows } = await client.query('SELECT (SELECT COUNT(*) FROM products) AS p, (SELECT COUNT(*) FROM staff_users) AS u');
  if (Number(rows[0].p) === 0) {
    await resetDemo(client);
    console.log('[db] dados de demonstração inseridos');
  } else if (Number(rows[0].u) === 0) {
    await upsertSeedUsers(client);
  }
}
