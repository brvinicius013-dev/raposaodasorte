// Acesso ao Postgres (Neon) — SOMENTE no servidor. A string fica em DATABASE_URL.
import { neon } from '@neondatabase/serverless';

let _sql = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!_sql) _sql = neon(url);
  return _sql;
}

let ensured = false;

export async function ensureSchema(sql) {
  if (ensured) return;
  await sql`CREATE TABLE IF NOT EXISTS bets (
    code text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now(),
    player text NOT NULL DEFAULT 'Visitante',
    stake numeric NOT NULL DEFAULT 0,
    total_odd numeric NOT NULL DEFAULT 0,
    possible_return numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'Aberto',
    live boolean NOT NULL DEFAULT false,
    selections jsonb NOT NULL DEFAULT '[]'
  )`;
  ensured = true;
}
