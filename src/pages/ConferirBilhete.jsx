import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtBRL, fmtDateTime, fmtOdd } from '../format.js';

export default function ConferirBilhete() {
  const [params] = useSearchParams();
  const { findTicket } = useBetSlip();
  const [code, setCode] = useState(params.get('codigo') || '');
  const [ticket, setTicket] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Converte a linha do banco (snake_case) para o formato usado na tela.
  const fromRow = (r) => ({
    code: r.code,
    createdAt: r.created_at,
    user: r.player,
    stake: Number(r.stake),
    totalOdd: Number(r.total_odd),
    possibleReturn: Number(r.possible_return),
    status: r.status,
    selections: r.selections || [],
  });

  const search = async (value) => {
    const local = findTicket(value);
    if (local) {
      setTicket(local);
      setNotFound(false);
      return;
    }
    // Não achou no navegador → tenta o banco (se o backend existir).
    try {
      const res = await fetch(`/api/bets?code=${encodeURIComponent(value.trim().toUpperCase())}`);
      if (res.ok) {
        setTicket(fromRow(await res.json()));
        setNotFound(false);
        return;
      }
    } catch {
      /* sem backend: segue como não encontrado */
    }
    setTicket(null);
    setNotFound(true);
  };

  useEffect(() => {
    const c = params.get('codigo');
    if (c) {
      setCode(c);
      search(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="contentPages">
      <h1 className="pageTitle">Conferir Bilhete</h1>
      <form
        className="checkTicket"
        onSubmit={(e) => {
          e.preventDefault();
          search(code);
        }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Código do bilhete" maxLength={8} />
        <button type="submit" className="btn">
          Conferir
        </button>
      </form>

      {notFound && <div className="formError">Bilhete não encontrado.</div>}

      {ticket && (
        <div className="ticket">
          <div className="ticket-head">
            <div>
              <span className="muted">Bilhete</span>
              <strong className="ticketCodeSmall">{ticket.code}</strong>
            </div>
            <span className="status">{ticket.status}</span>
          </div>
          <div className="ticket-meta">
            <span>Data: {fmtDateTime(ticket.createdAt)}</span>
            <span>Apostador: {ticket.user}</span>
          </div>
          <table className="tableTicket">
            <thead>
              <tr>
                <th>Jogo</th>
                <th>Mercado</th>
                <th>Palpite</th>
                <th>Cotação</th>
              </tr>
            </thead>
            <tbody>
              {ticket.selections.map((s, i) => (
                <tr key={i}>
                  <td>
                    <div>{s.match}</div>
                    <small className="muted">
                      {s.league} · {fmtDateTime(s.start)} · <span className={s.live ? 'tagLive' : 'tagPre'}>{s.live ? 'Ao Vivo' : 'Pré-Jogo'}</span>
                    </small>
                  </td>
                  <td>{s.market}</td>
                  <td>{s.pick}</td>
                  <td>{fmtOdd(s.odd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ticket-totals">
            <span className="valorApostado">Valor apostado <strong>{fmtBRL(ticket.stake)}</strong></span>
            <span className="cotacao">Cotação <strong>{fmtOdd(ticket.totalOdd)}</strong></span>
            <span className="possivelRetorno">Possível retorno <strong>{fmtBRL(ticket.possibleReturn)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
