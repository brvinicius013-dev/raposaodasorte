// Autenticação dos apostadores (demonstração). Senha com hash scrypt; token de sessão aleatório.
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

export function hashPassword(pw) {
  const salt = randomBytes(16);
  const dk = scryptSync(String(pw), salt, 64);
  return `scrypt$${salt.toString('hex')}$${dk.toString('hex')}`;
}

export function verifyPassword(pw, stored) {
  try {
    const [scheme, saltHex, hashHex] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const dk = scryptSync(String(pw), Buffer.from(saltHex, 'hex'), 64);
    const h = Buffer.from(hashHex, 'hex');
    return dk.length === h.length && timingSafeEqual(dk, h);
  } catch {
    return false;
  }
}

export function newToken() {
  return randomBytes(24).toString('base64url');
}

export async function userByToken(sql, token) {
  if (!token) return null;
  const rows = await sql`SELECT * FROM users WHERE token = ${token} LIMIT 1`;
  return rows[0] || null;
}

// Nunca devolve o hash da senha nem o token para o cliente além do necessário.
export function publicUser(u) {
  return { username: u.username, balance: Number(u.balance), pixKey: u.pix_key || '' };
}
