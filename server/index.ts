import bcrypt from 'bcryptjs';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, TABLE_COUNT, visualCategories } from '../src/data/mockData';
import type { CategoryId, Order, Payment, Role, ServiceLocation } from '../src/types';
import { DATABASE_URL, applySchema, ensureDatabase, pool, transaction } from './db';
import { ORDER_SELECT, PRODUCT_COLUMNS, rowToOrder, rowToProduct, rowToUser } from './mappers';
import { insertOrder, resetDemo, seedIfEmpty } from './seed';

const PORT = Number(process.env.PORT ?? 3333);
const JWT_SECRET = process.env.JWT_SECRET ?? 'pratello-dev-secret-troque-em-producao';

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const app = express();
app.use(express.json({ limit: '100kb' }));

/* ---------- Autenticação ---------- */

/** Exige token da equipe. Sem `roles`, qualquer funcionário passa. O cargo é relido do banco. */
const auth =
  (...roles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, 'Faça login para continuar.');
    let sub: string;
    try {
      sub = (jwt.verify(token, JWT_SECRET) as { sub: string }).sub;
    } catch {
      throw new HttpError(401, 'Sessão expirada. Faça login novamente.');
    }
    const { rows } = await pool.query('SELECT id, name, role FROM staff_users WHERE id = $1', [sub]);
    if (!rows[0]) throw new HttpError(401, 'Usuário não encontrado.');
    if (roles.length && !roles.includes(rows[0].role)) throw new HttpError(403, 'Você não tem permissão para isso.');
    res.locals.user = rows[0] as { id: string; name: string; role: Role };
    next();
  };

const staff = auth();
const admin = auth('admin');

/* ---------- Validação ---------- */

const str = (v: unknown, field: string, { required = true, max = 500 } = {}) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) throw new HttpError(400, `Campo obrigatório: ${field}.`);
  if (s.length > max) throw new HttpError(400, `${field} é muito longo.`);
  return s;
};

const money = (v: unknown, field: string) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new HttpError(400, `${field} inválido.`);
  return Math.round(n * 100) / 100;
};

const CATEGORIES: CategoryId[] = ['lanches', 'pratos', 'bebidas', 'sobremesas'];
const TAGS = new Set<string>(visualCategories.map((c) => c.id));

function parseProduct(b: Record<string, unknown>) {
  const price = money(b.price, 'Preço');
  const originalPrice = b.originalPrice === undefined || b.originalPrice === null ? null : money(b.originalPrice, 'Preço original');
  if (originalPrice !== null && originalPrice <= price) throw new HttpError(400, 'O preço "de" deve ser maior que o preço atual.');
  if (!CATEGORIES.includes(b.category as CategoryId)) throw new HttpError(400, 'Categoria inválida.');
  const prepTime = Number(b.prepTime);
  if (!Number.isInteger(prepTime) || prepTime <= 0 || prepTime > 240) throw new HttpError(400, 'Tempo de preparo inválido.');
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean) : []);
  return {
    name: str(b.name, 'Nome', { max: 120 }),
    description: str(b.description, 'Descrição', { required: false, max: 500 }),
    price,
    originalPrice,
    category: b.category as CategoryId,
    tags: list(b.tags).filter((t) => TAGS.has(t)),
    prepTime,
    image: str(b.image, 'Imagem', { required: false, max: 1000 }),
    available: b.available !== false,
    popular: b.popular === true,
    ingredients: list(b.ingredients).slice(0, 30),
  };
}

function parseLocation(v: unknown): ServiceLocation {
  const l = (v ?? {}) as Record<string, unknown>;
  if (l.mode === 'mesa') {
    const table = Number(l.table);
    if (!Number.isInteger(table) || table < 1 || table > TABLE_COUNT) throw new HttpError(400, 'Mesa inválida.');
    return { mode: 'mesa', table: String(table).padStart(2, '0') };
  }
  if (l.mode === 'delivery') {
    const a = (l.address ?? {}) as Record<string, unknown>;
    const cep = str(a.cep, 'CEP', { max: 9 });
    if (cep.replace(/\D/g, '').length !== 8) throw new HttpError(400, 'CEP inválido.');
    return {
      mode: 'delivery',
      address: {
        cep,
        street: str(a.street, 'Rua', { max: 200 }),
        number: str(a.number, 'Número', { max: 20 }),
        district: str(a.district, 'Bairro', { max: 120 }),
        complement: str(a.complement, 'Complemento', { required: false, max: 120 }),
      },
    };
  }
  throw new HttpError(400, 'Informe a mesa ou o endereço de entrega.');
}

/* ---------- Rotas: saúde e login ---------- */

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true, database: 'conectado' });
});

app.post('/api/auth/login', async (req, res) => {
  const login = str(req.body?.login, 'Usuário').toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const { rows } = await pool.query('SELECT * FROM staff_users WHERE lower(login) = $1', [login]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw new HttpError(401, 'Usuário ou senha inválidos.');
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: rowToUser(user) });
});

/* ---------- Rotas: cardápio ---------- */

app.get('/api/products', async (_req, res) => {
  const { rows } = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY seq`);
  res.json(rows.map(rowToProduct));
});

app.post('/api/products', admin, async (req, res) => {
  const p = parseProduct(req.body ?? {});
  const { rows } = await pool.query(
    `INSERT INTO products (id, name, description, price, original_price, category, tags, prep_time, image, available, popular, ingredients)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ${PRODUCT_COLUMNS}`,
    [randomUUID(), p.name, p.description, p.price, p.originalPrice, p.category, p.tags, p.prepTime, p.image, p.available, p.popular, p.ingredients],
  );
  res.status(201).json(rowToProduct(rows[0]));
});

app.put('/api/products/:id', admin, async (req, res) => {
  const p = parseProduct(req.body ?? {});
  const { rows } = await pool.query(
    `UPDATE products SET name=$2, description=$3, price=$4, original_price=$5, category=$6, tags=$7, prep_time=$8, image=$9, available=$10, popular=$11, ingredients=$12
     WHERE id = $1 RETURNING ${PRODUCT_COLUMNS}`,
    [req.params.id, p.name, p.description, p.price, p.originalPrice, p.category, p.tags, p.prepTime, p.image, p.available, p.popular, p.ingredients],
  );
  if (!rows[0]) throw new HttpError(404, 'Prato não encontrado.');
  res.json(rowToProduct(rows[0]));
});

app.patch('/api/products/:id/availability', admin, async (req, res) => {
  const { rows } = await pool.query(`UPDATE products SET available = NOT available WHERE id = $1 RETURNING ${PRODUCT_COLUMNS}`, [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Prato não encontrado.');
  res.json(rowToProduct(rows[0]));
});

app.delete('/api/products/:id', admin, async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'Prato não encontrado.');
  res.status(204).end();
});

/* ---------- Rotas: funcionários ---------- */

const parseRole = (v: unknown): Role => {
  if (v !== 'admin' && v !== 'funcionario') throw new HttpError(400, 'Cargo inválido.');
  return v;
};

async function adminCount(exceptId?: string) {
  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM staff_users WHERE role = 'admin' AND id <> COALESCE($1, '')", [exceptId ?? null]);
  return rows[0].n as number;
}

app.get('/api/users', admin, async (_req, res) => {
  const { rows } = await pool.query('SELECT id, name, role, login FROM staff_users ORDER BY created_at, name');
  res.json(rows.map(rowToUser));
});

app.post('/api/users', admin, async (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (password.length < 4) throw new HttpError(400, 'A senha deve ter pelo menos 4 caracteres.');
  const { rows } = await pool.query(
    'INSERT INTO staff_users (id, name, role, login, password_hash) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, role, login',
    [randomUUID(), str(req.body?.name, 'Nome', { max: 120 }), parseRole(req.body?.role), str(req.body?.login, 'Login', { max: 120 }).toLowerCase(), await bcrypt.hash(password, 10)],
  );
  res.status(201).json(rowToUser(rows[0]));
});

app.put('/api/users/:id', admin, async (req, res) => {
  const role = parseRole(req.body?.role);
  if (role !== 'admin' && (await adminCount(req.params.id)) === 0) throw new HttpError(400, 'É necessário manter pelo menos um administrador.');
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (password && password.length < 4) throw new HttpError(400, 'A senha deve ter pelo menos 4 caracteres.');
  const { rows } = await pool.query(
    `UPDATE staff_users SET name = $2, role = $3, login = $4, password_hash = COALESCE($5, password_hash)
     WHERE id = $1 RETURNING id, name, role, login`,
    [req.params.id, str(req.body?.name, 'Nome', { max: 120 }), role, str(req.body?.login, 'Login', { max: 120 }).toLowerCase(), password ? await bcrypt.hash(password, 10) : null],
  );
  if (!rows[0]) throw new HttpError(404, 'Funcionário não encontrado.');
  res.json(rowToUser(rows[0]));
});

app.delete('/api/users/:id', admin, async (req, res) => {
  if (req.params.id === res.locals.user.id) throw new HttpError(400, 'Você não pode excluir o próprio usuário.');
  if ((await adminCount(req.params.id)) === 0) throw new HttpError(400, 'É necessário manter pelo menos um administrador.');
  const { rowCount } = await pool.query('DELETE FROM staff_users WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'Funcionário não encontrado.');
  res.status(204).end();
});

/* ---------- Rotas: pedidos ---------- */

async function getOrder(id: string) {
  const { rows } = await pool.query(`${ORDER_SELECT} WHERE o.id = $1 GROUP BY o.id`, [id]);
  return rows[0] ? rowToOrder(rows[0]) : null;
}

// Painel da equipe: pedidos das últimas 24h (e qualquer um ainda em aberto)
app.get('/api/orders', staff, async (_req, res) => {
  const { rows } = await pool.query(
    `${ORDER_SELECT} WHERE o.created_at > now() - interval '24 hours' OR o.status <> 'entregue' GROUP BY o.id ORDER BY o.created_at`,
  );
  res.json(rows.map(rowToOrder));
});

// Cliente acompanha os próprios pedidos (o clientId é aleatório e fica só na aba dele)
app.get('/api/orders/client/:clientId', async (req, res) => {
  const { rows } = await pool.query(`${ORDER_SELECT} WHERE o.client_id = $1 GROUP BY o.id ORDER BY o.created_at`, [req.params.clientId]);
  res.json(rows.map(rowToOrder));
});

app.post('/api/orders', async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const location = parseLocation(b.location);
  const phone = str(b.phone, 'Telefone', { required: false, max: 20 });
  if (location.mode === 'delivery' && phone.replace(/\D/g, '').length < 10) throw new HttpError(400, 'Informe um telefone para a entrega.');

  const rawItems = Array.isArray(b.items) ? (b.items as Array<Record<string, unknown>>) : [];
  if (rawItems.length === 0 || rawItems.length > 50) throw new HttpError(400, 'O pedido precisa ter itens.');
  const wanted = new Map<string, number>();
  for (const it of rawItems) {
    const qty = Number(it.quantity);
    if (typeof it.productId !== 'string' || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new HttpError(400, 'Item inválido.');
    wanted.set(it.productId, (wanted.get(it.productId) ?? 0) + qty);
  }

  // Preços sempre vêm do banco — o cliente não consegue alterar o valor.
  const { rows: prods } = await pool.query('SELECT id, name, price, available FROM products WHERE id = ANY($1)', [[...wanted.keys()]]);
  const items = [...wanted].map(([productId, quantity]) => {
    const p = prods.find((x) => x.id === productId);
    if (!p || !p.available) throw new HttpError(409, `Um dos itens não está mais disponível. Atualize o carrinho.`);
    return { productId, name: p.name as string, price: p.price as number, quantity };
  });
  const subtotal = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  const deliveryFee = location.mode === 'delivery' && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const pay = (b.payment ?? {}) as Record<string, unknown>;
  let payment: Payment;
  if (pay.method === 'cartao') {
    payment = { method: 'cartao', cardType: pay.cardType === 'debito' ? 'debito' : 'credito', needsMachine: pay.needsMachine === true, status: 'pendente' };
  } else if (pay.method === 'pix') {
    payment = { method: 'pix', status: pay.pixPaid === true ? 'pago' : 'pendente' }; // simulação para a A3
  } else if (pay.method === 'dinheiro') {
    const changeFor = pay.changeFor === undefined || pay.changeFor === null ? undefined : Number(pay.changeFor);
    if (changeFor !== undefined && (!Number.isFinite(changeFor) || changeFor < total)) throw new HttpError(400, 'O troco deve ser para um valor maior que o total.');
    payment = { method: 'dinheiro', ...(changeFor !== undefined ? { changeFor } : {}), status: 'pendente' };
  } else {
    throw new HttpError(400, 'Escolha a forma de pagamento.');
  }

  const now = Date.now();
  const order: Omit<Order, 'number'> = {
    id: randomUUID(),
    clientId: str(b.clientId, 'Cliente', { max: 80 }),
    customerName: str(b.customerName, 'Nome', { max: 80 }),
    phone,
    location,
    items,
    notes: str(b.notes, 'Observações', { required: false, max: 500 }),
    subtotal,
    deliveryFee,
    total,
    payment,
    status: 'pendente',
    createdAt: now,
    updatedAt: now,
  };
  await transaction((client) => insertOrder(client, order));
  res.status(201).json(await getOrder(order.id));
});

app.patch('/api/orders/:id/advance', staff, async (req, res) => {
  const { rowCount } = await pool.query(
    `UPDATE orders SET updated_at = now(),
       status = CASE status WHEN 'pendente' THEN 'preparo' WHEN 'preparo' THEN 'pronto' WHEN 'pronto' THEN 'entregue' ELSE status END
     WHERE id = $1`,
    [req.params.id],
  );
  if (!rowCount) throw new HttpError(404, 'Pedido não encontrado.');
  res.json(await getOrder(req.params.id));
});

app.patch('/api/orders/:id/pay', staff, async (req, res) => {
  const { rowCount } = await pool.query("UPDATE orders SET payment_status = 'pago', updated_at = now() WHERE id = $1", [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'Pedido não encontrado.');
  res.json(await getOrder(req.params.id));
});

/* ---------- Rotas: administração ---------- */

app.post('/api/admin/reset', admin, async (_req, res) => {
  await transaction(resetDemo);
  res.json({ ok: true });
});

app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Rota não encontrada.')));

/* ---------- Erros ---------- */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
  const code = (err as { code?: string }).code;
  if (code === '23505') return void res.status(409).json({ error: 'Já existe um registro com esse valor (ex.: login repetido).' });
  if (code === '23514') return void res.status(400).json({ error: 'Dados inválidos.' });
  if ((err as { type?: string }).type === 'entity.parse.failed') return void res.status(400).json({ error: 'JSON inválido.' });
  console.error(err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

/* ---------- Inicialização ---------- */

async function start() {
  const safeUrl = DATABASE_URL.replace(/:\/\/([^:]+):[^@]*@/, '://$1:****@');
  try {
    await ensureDatabase();
    await applySchema();
    await transaction(seedIfEmpty);
  } catch (e) {
    console.error(`\n[db] Não foi possível conectar ao PostgreSQL em ${safeUrl}`);
    console.error(`[db] ${(e as Error).message}`);
    console.error('[db] Confira usuário/senha no arquivo .env (DATABASE_URL) e se o serviço do PostgreSQL está ligado.\n');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`[api] Pratello API em http://localhost:${PORT}  ·  banco: ${safeUrl}`));
}

start();
