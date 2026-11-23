// Carteira do apostador (demonstração): depósito e saque SIMULADOS, chave PIX FICTÍCIA.
// Nenhum valor é dinheiro real; nenhum pagamento é processado.
import { db, ensureSchema } from './_db.js';
import { publicUser, userByToken } from './_auth.js';

const MAX = 100000;

export default async function handler(req, res) {
  const sql = db();
  if (!sql) return res.status(503).json({ error: 'DATABASE_URL nao configurada' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'metodo nao permitido' });
  }

  try {
    await ensureSchema(sql);
    const u = await userByToken(sql, req.headers['x-user-token'] || '');
    if (!u) return res.status(401).json({ error: 'nao autenticado' });

    const { action, amount, pixKey } = req.body || {};

    if (action === 'deposit') {
      const v = Math.min(MAX, Math.max(0, Number(amount) || 0));
      const rows = await sql`UPDATE users SET balance = balance + ${v} WHERE id = ${u.id} RETURNING *`;
      return res.status(200).json(publicUser(rows[0]));
    }

    if (action === 'setpix') {
      const key = String(pixKey || '').slice(0, 80);
      const rows = await sql`UPDATE users SET pix_key = ${key} WHERE id = ${u.id} RETURNING *`;
      return res.status(200).json(publicUser(rows[0]));
    }

    if (action === 'withdraw') {
      const v = Math.max(0, Number(amount) || 0);
      if (v <= 0) return res.status(400).json({ error: 'valor invalido' });
      if (Number(u.balance) < v) return res.status(400).json({ error: 'saldo insuficiente' });
      const rows = await sql`UPDATE users SET balance = balance - ${v} WHERE id = ${u.id} RETURNING *`;
      await sql`INSERT INTO withdrawals (username, amount, pix_key, status)
        VALUES (${u.username}, ${v}, ${u.pix_key || ''}, 'Solicitado')`;
      return res.status(200).json(publicUser(rows[0]));
    }

    return res.status(400).json({ error: 'acao invalida' });
  } catch (e) {
    return res.status(500).json({ error: 'erro no banco', detail: String(e.message || e) });
  }
}
