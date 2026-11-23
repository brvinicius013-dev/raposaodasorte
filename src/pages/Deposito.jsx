import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FakeQR from '../components/FakeQR.jsx';
import { useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtBRL } from '../format.js';

const AMOUNTS = [10, 20, 50, 100, 200];
const EXPIRES = 15 * 60; // 15 min, só para dar o clima

// Código "copia e cola" propositalmente FALSO: não é um payload PIX válido.
function fakeCode(id, amount) {
  return `DEMO-PIX-SEM-VALOR-REAL-${amount.toFixed(2)}-${id}`;
}

export default function Deposito() {
  const { balance, deposit } = useBetSlip();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(50);
  const [stage, setStage] = useState('form'); // form | pending | paid
  const [txid, setTxid] = useState('');
  const [left, setLeft] = useState(EXPIRES);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const start = () => {
    if (amount <= 0) return;
    setTxid('AO' + Math.random().toString(36).slice(2, 10).toUpperCase());
    setLeft(EXPIRES);
    setStage('pending');
  };

  // Conta regressiva enquanto espera o "pagamento"
  useEffect(() => {
    if (stage !== 'pending') return;
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(timer.current);
          setStage('form');
          return EXPIRES;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [stage]);

  const confirmPaid = async () => {
    clearInterval(timer.current);
    await deposit(amount);
    setStage('paid');
  };

  const code = fakeCode(txid, amount);
  const mmss = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;

  return (
    <div className="contentPages deposito">
      <div className="demoBanner">⚠️ Depósito de demonstração — PIX simulado, nenhum valor é real.</div>
      <h1 className="pageTitle">Depositar via PIX</h1>
      <div className="saldoBox">
        Saldo atual <strong>{fmtBRL(balance)}</strong>
      </div>

      {stage === 'form' && (
        <div className="depForm">
          <label className="depLabel">Valor do depósito</label>
          <div className="depAmounts">
            {AMOUNTS.map((v) => (
              <button key={v} type="button" className={amount === v ? 'active' : ''} onClick={() => setAmount(v)}>
                {fmtBRL(v)}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            step="1"
            className="depInput"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          />
          <button type="button" className="btn depGenerate" onClick={start}>
            Gerar PIX
          </button>
        </div>
      )}

      {stage === 'pending' && (
        <div className="depPending">
          <p className="depValue">
            Pague <strong>{fmtBRL(amount)}</strong> escaneando o QR
          </p>
          <FakeQR seed={txid} size={210} />
          <p className="depExpire">Expira em {mmss}</p>
          <div className="depCopy">
            <input readOnly value={code} onFocus={(e) => e.target.select()} />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(code).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? 'Copiado ✓' : 'Copiar'}
            </button>
          </div>
          <p className="depHint">Este código é fictício e não abre em nenhum app de banco.</p>
          <button type="button" className="btn depSim" onClick={confirmPaid}>
            Simular pagamento
          </button>
          <button type="button" className="btnLink" onClick={() => setStage('form')}>
            Cancelar
          </button>
        </div>
      )}

      {stage === 'paid' && (
        <div className="depPaid">
          <div className="depCheck">✓</div>
          <h2>Depósito simulado confirmado</h2>
          <p>
            {fmtBRL(amount)} creditados no seu saldo fictício. Novo saldo: <strong>{fmtBRL(balance)}</strong>.
          </p>
          <div className="depActions">
            <button type="button" className="btn" onClick={() => navigate('/')}>
              Ver jogos
            </button>
            <button
              type="button"
              className="btn btnSecondary"
              onClick={() => {
                setStage('form');
              }}
            >
              Depositar mais
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
