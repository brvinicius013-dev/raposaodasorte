import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStakeError } from '../components/BetSlip.jsx';
import TicketModal, { maskToValue } from '../components/TicketModal.jsx';
import { MIN_STAKE, useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtBRL, fmtOdd } from '../format.js';

// Cupom em tela cheia (abre pelo botão "Cupom" da barra).
export default function MobileBetSlip() {
  const {
    selections, remove, clear, stake, setStake, stakeValue, totalOdd, possibleReturn, finalize,
    slipOpen, setSlipOpen, balance,
  } = useBetSlip();
  const [ticket, setTicket] = useState(null);
  const stakeError = useStakeError();
  const canFinish = selections.length > 0 && stakeValue >= MIN_STAKE && !stakeError;

  useEffect(() => {
    document.body.style.overflow = slipOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [slipOpen]);

  return (
    <>
      {slipOpen && (
        <div className="m-slip">
          <div className="m-slip-header">
            {selections.length > 0 && (
              <button type="button" className="m-slip-clear" onClick={clear}>
                Limpar
              </button>
            )}
            <span>Cupom de Apostas</span>
            <button type="button" className="m-slip-close" onClick={() => setSlipOpen(false)} aria-label="Fechar">
              ✕
            </button>
          </div>
          <div className="m-slip-body">
            {selections.length === 0 && (
              <div className="betslip-empty">Toque nas cotações para adicionar palpites ao cupom.</div>
            )}
            {selections.map((s) => (
              <div className="betslip-item" key={s.matchId}>
                <div className="betslip-item-header">
                  <span>
                    {s.match.home} x {s.match.away}
                  </span>
                  <button type="button" onClick={() => remove(s.matchId)} aria-label="Remover palpite">
                    ✕
                  </button>
                </div>
                <div className="betslip-item-body">
                  <div>
                    <div className="market">{s.marketName}</div>
                    <div className="pick">{s.pickLabel}</div>
                  </div>
                  <strong className="itemOdd">{fmtOdd(s.odd)}</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="m-slip-footer">
            <div className="m-slip-totals">
              <div>
                <span>Cotação</span>
                <strong>{fmtOdd(totalOdd || 0) === '-' ? '0,00' : fmtOdd(totalOdd)}</strong>
              </div>
              <div className="right">
                <span>Possível Retorno</span>
                <strong>{fmtBRL(possibleReturn)}</strong>
              </div>
            </div>
            <div className="m-slip-value">
              <span className="legend">Valor da Aposta</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="R$ 0,00"
                value={stake ? fmtBRL(Number(stake)) : ''}
                onChange={(e) => setStake(maskToValue(e.target.value))}
              />
            </div>
            <div className="quickValues">
              {[5, 10, 20, 50].map((v) => (
                <button key={v} type="button" onClick={() => setStake(((Number(stake) || 0) + v).toFixed(2))}>
                  +{v}
                </button>
              ))}
            </div>
            <div className="slipBalance">
              <span>Saldo: {fmtBRL(balance)}</span>
              <Link to="/deposito" onClick={() => setSlipOpen(false)}>
                Depositar
              </Link>
            </div>
            {stakeError && <div className="formError">{stakeError}</div>}
            <button
              type="button"
              className="m-slip-finish"
              disabled={!canFinish}
              onClick={async () => {
                const t = await finalize();
                if (t) setTicket(t);
              }}
            >
              Finalizar
            </button>
          </div>
        </div>
      )}
      <TicketModal
        ticket={ticket}
        onClose={() => {
          setTicket(null);
          setSlipOpen(false);
        }}
      />
    </>
  );
}
