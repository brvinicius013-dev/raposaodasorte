import { useEffect, useState } from 'react';
import { fmtBRL, fmtDateTime, fmtOdd } from '../format.js';

const TOKEN_KEY = 'arena.admintoken';

function Tile({ label, value, tone }) {
  return (
    <div className={`admTile ${tone || ''}`}>
      <span className="admTile-label">{label}</span>
      <strong className="admTile-value">{value}</strong>
    </div>
  );
}

// Barras horizontais de uma cor (verde da marca), com rótulo de valor.
function Bars({ rows, max, label, format }) {
  return (
    <div className="admBars">
      {rows.map((r, i) => (
        <div className="admBar-row" key={i} title={`${r.name}: ${format(r.value)}`}>
          <span className="admBar-name">{r.name}</span>
          <span className="admBar-track">
            <span className="admBar-fill" style={{ width: `${max ? (r.value / max) * 100 : 0}%` }} />
          </span>
          <span className="admBar-value">{format(r.value)}</span>
        </div>
      ))}
      {!rows.length && <div className="admEmpty">Sem {label} ainda.</div>}
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (tk) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin', { headers: { 'x-admin-token': tk } });
      if (res.status === 401) {
        setError('Token incorreto.');
        setData(null);
      } else if (res.status === 503) {
        const j = await res.json().catch(() => ({}));
        setError(`Backend não configurado (${j.error || 'defina DATABASE_URL e ADMIN_TOKEN na Vercel'}).`);
        setData(null);
      } else if (!res.ok) {
        setError(`Falha (${res.status}).`);
        setData(null);
      } else {
        setData(await res.json());
        try {
          sessionStorage.setItem(TOKEN_KEY, tk);
        } catch {
          /* ignore */
        }
      }
    } catch {
      setError('Não foi possível acessar /api/admin. No deploy da Vercel funciona; localmente precisa de "vercel dev".');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let saved = '';
    try {
      saved = sessionStorage.getItem(TOKEN_KEY) || '';
    } catch {
      /* ignore */
    }
    if (saved) {
      setToken(saved);
      load(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    setData(null);
    setToken('');
  };

  if (!data) {
    return (
      <div className="contentPages admLogin">
        <h1 className="pageTitle">Painel do Operador</h1>
        <p className="muted">Acesso restrito. Informe o token de administrador.</p>
        <form
          className="checkTicket"
          onSubmit={(e) => {
            e.preventDefault();
            if (token) load(token);
          }}
        >
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            autoComplete="off"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? '...' : 'Entrar'}
          </button>
        </form>
        {error && <div className="formError">{error}</div>}
      </div>
    );
  }

  const t = data.totals;
  const diaRows = [...data.porDia].reverse().map((d) => ({ name: d.dia, value: Number(d.total) }));
  const diaMax = Math.max(1, ...diaRows.map((d) => d.value));
  const expoRows = data.exposicao.map((e) => ({ name: e.jogo, value: Number(e.apostado), palpites: e.palpites }));
  const expoMax = Math.max(1, ...expoRows.map((e) => e.value));

  return (
    <div className="contentPages admPanel">
      <div className="admHead">
        <h1 className="pageTitle">Painel do Operador</h1>
        <button type="button" className="btnLink" onClick={logout}>
          Sair
        </button>
      </div>
      <div className="demoBanner">Dados de demonstração — nenhum valor é dinheiro real.</div>

      <div className="admTiles">
        <Tile label="Bilhetes" value={t.bilhetes} />
        <Tile label="Total apostado" value={fmtBRL(Number(t.total_apostado))} />
        <Tile label={`GGR teórico (${Math.round(data.margin * 100)}%)`} value={fmtBRL(data.ggr)} tone="good" />
        <Tile label="Risco em aberto" value={fmtBRL(Number(t.risco_total))} tone="warn" />
      </div>
      <div className="admTiles small">
        <Tile label="Abertos" value={t.abertos} />
        <Tile label="Ganhos" value={t.ganhos} />
        <Tile label="Perdidos" value={t.perdidos} />
      </div>

      <section className="admCard">
        <h2>Apostado por dia</h2>
        <Bars rows={diaRows} max={diaMax} label="movimento" format={fmtBRL} />
      </section>

      <section className="admCard">
        <h2>Exposição por jogo (total apostado)</h2>
        <Bars rows={expoRows} max={expoMax} label="apostas por jogo" format={fmtBRL} />
      </section>

      <section className="admCard">
        <h2>Bilhetes recentes</h2>
        <div className="admTableWrap">
          <table className="tableTicket">
            <thead>
              <tr>
                <th>Código</th>
                <th>Data</th>
                <th>Apostador</th>
                <th>Valor</th>
                <th>Cotação</th>
                <th>Retorno</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentes.map((r) => (
                <tr key={r.code}>
                  <td className="mono">{r.code}</td>
                  <td>{fmtDateTime(r.created_at)}</td>
                  <td>{r.player}</td>
                  <td>{fmtBRL(Number(r.stake))}</td>
                  <td>{fmtOdd(Number(r.total_odd))}</td>
                  <td>{fmtBRL(Number(r.possible_return))}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
              {!data.recentes.length && (
                <tr>
                  <td colSpan={7} className="admEmpty">
                    Nenhum bilhete registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admCard">
        <h2>Apostadores</h2>
        <div className="admTableWrap">
          <table className="tableTicket">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Saldo</th>
                <th>Chave PIX (fictícia)</th>
                <th>Desde</th>
              </tr>
            </thead>
            <tbody>
              {(data.apostadores || []).map((a) => (
                <tr key={a.username}>
                  <td>{a.username}</td>
                  <td>{fmtBRL(Number(a.balance))}</td>
                  <td className="mono">{a.pix_key || '—'}</td>
                  <td>{fmtDateTime(a.created_at)}</td>
                </tr>
              ))}
              {!(data.apostadores || []).length && (
                <tr>
                  <td colSpan={4} className="admEmpty">
                    Nenhum apostador cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admCard">
        <h2>Saques solicitados (simulados)</h2>
        <div className="admTableWrap">
          <table className="tableTicket">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Valor</th>
                <th>Chave PIX</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {(data.saques || []).map((s, i) => (
                <tr key={i}>
                  <td>{s.username}</td>
                  <td>{fmtBRL(Number(s.amount))}</td>
                  <td className="mono">{s.pix_key || '—'}</td>
                  <td>{s.status}</td>
                  <td>{fmtDateTime(s.created_at)}</td>
                </tr>
              ))}
              {!(data.saques || []).length && (
                <tr>
                  <td colSpan={5} className="admEmpty">
                    Nenhum saque solicitado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
