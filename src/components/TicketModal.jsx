import { Link } from 'react-router-dom';
import { fmtBRL, fmtOdd } from '../format.js';

// Converte o que é digitado em centavos: "1234" -> "12.34" (máscara de moeda).
export function maskToValue(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 7);
  if (!digits) return '';
  return (Number(digits) / 100).toFixed(2);
}

export default function TicketModal({ ticket, onClose }) {
  if (!ticket) return null;
  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">Aposta registrada</div>
        <div className="modal-body">
          <p>Guarde o código do seu bilhete:</p>
          <div className="ticketCode">{ticket.code}</div>
          <div className="ticketSummary">
            <span>Cotação: <strong>{fmtOdd(ticket.totalOdd)}</strong></span>
            <span>Valor: <strong>{fmtBRL(ticket.stake)}</strong></span>
            <span>Possível retorno: <strong>{fmtBRL(ticket.possibleReturn)}</strong></span>
          </div>
          <p className="muted">Bilhete de demonstração, sem valor real.</p>
        </div>
        <div className="modal-footer">
          <Link to={`/conferir-bilhete?codigo=${ticket.code}`} className="btn" onClick={onClose}>
            Ver bilhete
          </Link>
          <button type="button" className="btn btnSecondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
