import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MAX_STAKE, MIN_STAKE, useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtBRL, fmtOdd } from '../format.js';
import TicketModal, { maskToValue } from './TicketModal.jsx';

export function useStakeError() {
  const { stakeValue, balance } = useBetSlip();
  if (stakeValue && stakeValue < MIN_STAKE) return `Aposta mínima de ${fmtBRL(MIN_STAKE)}`;
  if (stakeValue > MAX_STAKE) return `Aposta máxima de ${fmtBRL(MAX_STAKE)}`;
  if (stakeValue > balance) return `Saldo insuficiente (${fmtBRL(balance)})`;
  return '';
}

// Cupom do layout desktop (coluna à direita; vira gaveta em telas médias).
export default function BetSlip() {
  const {
    selections, remove, clear, stake, setStake, stakeValue, totalOdd, possibleReturn, finalize,
    slipOpen, setSlipOpen,
  } = useBetSlip();
  const { balance } = useBetSlip();
  const [ticket, setTicket] = useState(null);
  const stakeError = useStakeError();
  const canFinish = selections.length > 0 && stakeValue >= MIN_STAKE && !stakeError;

  return (
    <>
      <button type="button" className="betslipFab" onClick={() => setSlipOpen(true)}>
        Cupom <span className="badge">{selections.length}</span>
        {selections.length > 0 && <span className="fabOdd">{fmtOdd(totalOdd)}</span>}
      </button>
      <div className={`sidebarBackdrop betslipBackdrop ${slipOpen ? 'show' : ''}`} onClick={() => setSlipOpen(false)} />
      <aside className={`betslip ${slipOpen ? 'open' : ''}`}>
        <div className="betslip-header">
          <span>Cupom de Apostas</span>
          {selections.length > 0 && (
            <button type="button" className="clearSlip" onClick={clear}>
              Limpar
            </button>
          )}
          <button type="button" className="closeSlip" onClick={() => setSlipOpen(false)} aria-label="Fechar cupom">
            ✕
          </button>
        </div>
        <div className="betslip-body">
          {selections.length === 0 && (
            <div className="betslip-empty">Clique nas cotações para adicionar palpites ao cupom.</div>
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
        <div className="betslip-footer">
          <div className="oddAndPossibleReturn">
            <div className="slipOdd">
              <span>Cotação</span>
              <strong>{selections.length ? fmtOdd(totalOdd) : '-'}</strong>
            </div>
            <div className="possibleReturn">
              <span>Possível Retorno</span>
              <strong>{fmtBRL(possibleReturn)}</strong>
            </div>
          </div>
          <div className="valueBet">
            <div className="legend">Valor da Aposta</div>
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
          <div className="finishBet">
            <button type="button" disabled={!canFinish} onClick={() => setTicket(finalize())}>
              Finalizar
            </button>
          </div>
        </div>
      </aside>
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
