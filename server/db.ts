import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

// NUMERIC chega do driver como string; converte para número.
pg.types.setTypeParser(1700, (v) => parseFloat(v));

export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/pratello';

export const pool = new pg.Pool({ connectionString: DATABASE_URL });

/** Cria o banco (ex.: "pratello") caso ainda não exista. */
export async function ensureDatabase() {
  const url = new URL(DATABASE_URL);
  const dbName = decodeURIComponent(url.pathname.slice(1));
  url.pathname = '/postgres';
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (!rowCount) {
      await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`[db] banco "${dbName}" criado`);
    }
  } finally {
    await admin.end();
  }
}

export async function applySchema() {
  const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf-8');
  await pool.query(sql);
}

/** Executa `fn` dentro de uma transação. */
export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
