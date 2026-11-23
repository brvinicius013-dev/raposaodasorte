// Painel do operador (leitura). Protegido por ADMIN_TOKEN (header x-admin-token).
import { db, ensureSchema } from './_db.js';

const MARGIN = 0.07; // margem teórica embutida nas odds (~7%)

export default async function handler(req, res) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return res.status(503).json({ error: 'ADMIN_TOKEN nao configurado' });
  const sent = req.headers['x-admin-token'] || '';
  if (sent !== token) return res.status(401).json({ error: 'nao autorizado' });

  const sql = db();
  if (!sql) return res.status(503).json({ error: 'DATABASE_URL nao configurada' });

  try {
    await ensureSchema(sql);

    const totalsRows = await sql`SELECT
      count(*)::int AS bilhetes,
      coalesce(sum(stake), 0) AS total_apostado,
      coalesce(sum(possible_return - stake), 0) AS risco_total,
      count(*) FILTER (WHERE status = 'Aberto')::int AS abertos,
      count(*) FILTER (WHERE status = 'Ganho')::int AS ganhos,
      count(*) FILTER (WHERE status = 'Perdido')::int AS perdidos
      FROM bets`;
    const totals = totalsRows[0];

    const porDia = await sql`SELECT to_char(date_trunc('day', created_at), 'DD/MM') AS dia,
      coalesce(sum(stake), 0) AS total
      FROM bets GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at) DESC LIMIT 14`;

    const exposicao = await sql`SELECT sel->>'match' AS jogo,
      count(*)::int AS palpites,
      coalesce(sum(stake), 0) AS apostado
      FROM bets, jsonb_array_elements(selections) AS sel
      GROUP BY sel->>'match' ORDER BY apostado DESC LIMIT 10`;

    const recentes = await sql`SELECT code, created_at, player, stake, total_odd, possible_return, status
      FROM bets ORDER BY created_at DESC LIMIT 20`;

    const apostadores = await sql`SELECT username, balance, pix_key, created_at
      FROM users ORDER BY created_at DESC LIMIT 50`;

    const saques = await sql`SELECT username, amount, pix_key, status, created_at
      FROM withdrawals ORDER BY created_at DESC LIMIT 20`;

    const ggr = Number(totals.total_apostado) * MARGIN;

    return res.status(200).json({ totals, ggr, margin: MARGIN, porDia, exposicao, recentes, apostadores, saques });
  } catch (e) {
    return res.status(500).json({ error: 'erro no banco', detail: String(e.message || e) });
  }
}
