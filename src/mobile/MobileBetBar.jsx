import { useBetSlip } from '../context/BetSlipContext.jsx';
import { maskToValue } from '../components/TicketModal.jsx';
import { fmtBRL } from '../format.js';

// Barra fixa sob o cabeçalho: valor da aposta, possível retorno e botão do cupom.
export default function MobileBetBar() {
  const { selections, stake, setStake, possibleReturn, setSlipOpen } = useBetSlip();
  return (
    <div className="m-betbar">
      <div className="m-betbar-value">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="R$ 0,00"
          aria-label="Valor da aposta"
          value={stake ? fmtBRL(Number(stake)) : ''}
          onChange={(e) => setStake(maskToValue(e.target.value))}
        />
      </div>
      <div className="m-betbar-return">
        <span className="legend">Possível Retorno</span>
        <strong>{fmtBRL(possibleReturn)}</strong>
      </div>
      <button type="button" className="m-betbar-button" onClick={() => setSlipOpen(true)}>
        Cupom
        <span className={`m-bagged ${selections.length ? 'pop' : ''}`} key={selections.length}>
          {selections.length}
        </span>
      </button>
    </div>
  );
}
