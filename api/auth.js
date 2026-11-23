// Cadastro / login dos apostadores (demonstração). GET = dados da sessão (me).
import { db, ensureSchema } from './_db.js';
import { hashPassword, newToken, publicUser, userByToken, verifyPassword } from './_auth.js';

const URE = /^[a-zA-Z0-9_.]{3,24}$/;

export default async function handler(req, res) {
  const sql = db();
  if (!sql) return res.status(503).json({ error: 'DATABASE_URL nao configurada' });

  try {
    await ensureSchema(sql);

    if (req.method === 'GET') {
      const u = await userByToken(sql, req.headers['x-user-token'] || '');
      if (!u) return res.status(401).json({ error: 'nao autenticado' });
      return res.status(200).json(publicUser(u));
    }

    if (req.method === 'POST') {
      const { action, username, password } = req.body || {};

      if (action === 'register') {
        if (!URE.test(String(username || '')))
          return res.status(400).json({ error: 'usuario invalido (3-24, letras/numeros/._)' });
        if (String(password || '').length < 4)
          return res.status(400).json({ error: 'senha muito curta (minimo 4)' });
        const exists = await sql`SELECT 1 FROM users WHERE username = ${username} LIMIT 1`;
        if (exists.length) return res.status(409).json({ error: 'usuario ja existe' });
        const token = newToken();
        const rows = await sql`INSERT INTO users (username, pass_hash, token)
          VALUES (${username}, ${hashPassword(password)}, ${token}) RETURNING *`;
        return res.status(201).json({ token, user: publicUser(rows[0]) });
      }

      if (action === 'login') {
        const rows = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`;
        const u = rows[0];
        if (!u || !verifyPassword(password, u.pass_hash))
          return res.status(401).json({ error: 'usuario ou senha invalidos' });
        const token = newToken();
        await sql`UPDATE users SET token = ${token} WHERE id = ${u.id}`;
        return res.status(200).json({ token, user: publicUser({ ...u, token }) });
      }

      if (action === 'logout') {
        const token = req.headers['x-user-token'] || '';
        if (token) await sql`UPDATE users SET token = NULL WHERE token = ${token}`;
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'acao invalida' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'metodo nao permitido' });
  } catch (e) {
    return res.status(500).json({ error: 'erro no banco', detail: String(e.message || e) });
  }
}
