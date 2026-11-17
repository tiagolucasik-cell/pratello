-- Pratello · esquema do banco (PostgreSQL)
-- Executado automaticamente ao iniciar a API (idempotente).

CREATE TABLE IF NOT EXISTS products (
  id             TEXT PRIMARY KEY,
  seq            SERIAL,                       -- ordem de exibição
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  price          NUMERIC(10,2) NOT NULL CHECK (price > 0),
  original_price NUMERIC(10,2) CHECK (original_price IS NULL OR original_price > price),
  category       TEXT NOT NULL CHECK (category IN ('lanches', 'pratos', 'bebidas', 'sobremesas')),
  tags           TEXT[] NOT NULL DEFAULT '{}', -- categorias da vitrine (japonesa, açaí...)
  prep_time      INT NOT NULL DEFAULT 20 CHECK (prep_time > 0),
  image          TEXT NOT NULL DEFAULT '',
  available      BOOLEAN NOT NULL DEFAULT TRUE,
  popular        BOOLEAN NOT NULL DEFAULT FALSE,
  ingredients    TEXT[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'funcionario')),
  login         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 101;

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  number         INT NOT NULL UNIQUE DEFAULT nextval('order_number_seq'),
  client_id      TEXT NOT NULL,
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL DEFAULT '',

  -- localização
  location_mode  TEXT NOT NULL CHECK (location_mode IN ('mesa', 'delivery')),
  table_number   TEXT,
  cep            TEXT,
  street         TEXT,
  address_number TEXT,
  district       TEXT,
  complement     TEXT,

  notes          TEXT NOT NULL DEFAULT '',
  subtotal       NUMERIC(10,2) NOT NULL,
  delivery_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(10,2) NOT NULL,

  -- pagamento
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cartao', 'pix', 'dinheiro')),
  card_type      TEXT CHECK (card_type IN ('credito', 'debito')),
  needs_machine  BOOLEAN,
  change_for     NUMERIC(10,2),
  payment_status TEXT NOT NULL DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago')),

  status         TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'preparo', 'pronto', 'entregue')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT location_complete CHECK (
    (location_mode = 'mesa' AND table_number IS NOT NULL) OR
    (location_mode = 'delivery' AND cep IS NOT NULL AND street IS NOT NULL AND address_number IS NOT NULL AND district IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL, -- prato excluído não apaga o histórico
  name       TEXT NOT NULL,                                   -- nome e preço no momento da compra
  unit_price NUMERIC(10,2) NOT NULL,
  quantity   INT NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_client     ON orders (client_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
