// Bilhetes: POST cria, GET ?code= consulta. Dados de demonstração (sem dinheiro real).
import { db, ensureSchema } from './_db.js';
import { userByToken } from './_auth.js';

const CODE_RE = /^[A-Z0-9]{4,16}$/;

export default async function handler(req, res) {
  const sql = db();
  if (!sql) return res.status(503).json({ error: 'DATABASE_URL nao configurada' });

  try {
    await ensureSchema(sql);

    if (req.method === 'POST') {
      const b = req.body || {};
      const code = String(b.code || '').toUpperCase();
      if (!CODE_RE.test(code)) return res.status(400).json({ error: 'code invalido' });
      const player = String(b.player || b.user || 'Visitante').slice(0, 40);
      const stake = Number(b.stake) || 0;
      const totalOdd = Number(b.totalOdd) || 0;
      const possibleReturn = Number(b.possibleReturn) || 0;
      const selections = Array.isArray(b.selections) ? b.selections.slice(0, 20) : [];
      const live = Boolean(b.live) || selections.some((s) => s && s.live);

      // Se vier com sessão de apostador, desconta do saldo FICTÍCIO da conta.
      let balance = null;
      let who = player;
      const u = await userByToken(sql, req.headers['x-user-token'] || '');
      if (u) {
        if (Number(u.balance) < stake) return res.status(400).json({ error: 'saldo insuficiente' });
        await sql`UPDATE users SET balance = balance - ${stake} WHERE id = ${u.id}`;
        balance = Number(u.balance) - stake;
        who = u.username;
      }

      await sql`INSERT INTO bets (code, player, stake, total_odd, possible_return, status, live, selections)
        VALUES (${code}, ${who}, ${stake}, ${totalOdd}, ${possibleReturn}, 'Aberto', ${live}, ${JSON.stringify(
        selections,
      )}::jsonb)
        ON CONFLICT (code) DO NOTHING`;
      return res.status(201).json({ ok: true, code, balance });
    }

    if (req.method === 'GET') {
      const code = String(req.query.code || '').toUpperCase();
      if (code) {
        if (!CODE_RE.test(code)) return res.status(400).json({ error: 'code invalido' });
        const rows = await sql`SELECT * FROM bets WHERE code = ${code} LIMIT 1`;
        if (!rows.length) return res.status(404).json({ error: 'nao encontrado' });
        return res.status(200).json(rows[0]);
      }
      // Sem code: histórico do apostador logado.
      const u = await userByToken(sql, req.headers['x-user-token'] || '');
      if (!u) return res.status(401).json({ error: 'informe um code ou autentique' });
      const rows = await sql`SELECT code, created_at, stake, total_odd, possible_return, status, live, selections
        FROM bets WHERE player = ${u.username} ORDER BY created_at DESC LIMIT 50`;
      return res.status(200).json(rows);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'metodo nao permitido' });
  } catch (e) {
    return res.status(500).json({ error: 'erro no banco', detail: String(e.message || e) });
  }
}
