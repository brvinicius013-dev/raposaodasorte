import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtBRL, fmtDateTime, fmtOdd } from '../format.js';

// Login / cadastro e carteira do apostador. TUDO FICTÍCIO: saldo, PIX e saque são simulados.
export default function Conta() {
  const { account, login, register, logout, balance, setPix, withdraw, myBets } = useBetSlip();

  if (!account) return <AuthForms login={login} register={register} />;
  return (
    <Wallet account={account} balance={balance} setPix={setPix} withdraw={withdraw} logout={logout} myBets={myBets} />
  );
}

function AuthForms({ login, register }) {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const fn = mode === 'login' ? login : register;
    const res = await fn(username.trim(), password);
    setBusy(false);
    if (res.error) setError(res.error);
  };

  return (
    <div className="contentPages conta">
      <h1 className="pageTitle">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
      <div className="demoBanner">Conta de demonstração — saldo fictício, sem dinheiro real.</div>
      <div className="contaTabs">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Entrar
        </button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          Cadastrar
        </button>
      </div>
      <form className="contaForm" onSubmit={submit}>
        <label>
          Usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {error && <div className="formError">{error}</div>}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? '...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
        <p className="muted">Não use uma senha de verdade — é um projeto de demonstração.</p>
      </form>
    </div>
  );
}

function Wallet({ account, balance, setPix, withdraw, logout, myBets }) {
  const [pix, setPixInput] = useState(account.pixKey || '');
  const [wAmount, setWAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [bets, setBets] = useState(null); // null = carregando

  useEffect(() => {
    let alive = true;
    myBets().then((list) => alive && setBets(list));
    return () => {
      alive = false;
    };
  }, [myBets]);

  const savePix = async () => {
    setMsg('');
    setErr('');
    const r = await setPix(pix.trim());
    if (r.error) setErr(r.error);
    else setMsg('Chave PIX fictícia salva.');
  };

  const requestWithdraw = async () => {
    setMsg('');
    setErr('');
    const v = Number(wAmount) || 0;
    if (v <= 0) return setErr('Informe um valor.');
    if (!account.pixKey) return setErr('Cadastre uma chave PIX fictícia primeiro.');
    const r = await withdraw(v);
    if (r.error) setErr(r.error === 'saldo insuficiente' ? 'Saldo insuficiente.' : r.error);
    else {
      setMsg(`Saque simulado de ${fmtBRL(v)} solicitado (demonstração, nada é pago).`);
      setWAmount('');
    }
  };

  return (
    <div className="contentPages conta">
      <div className="admHead">
        <h1 className="pageTitle">Minha Conta</h1>
        <button type="button" className="btnLink" onClick={logout}>
          Sair
        </button>
      </div>
      <div className="demoBanner">
        Tudo aqui é fictício: saldo, chave PIX e saque são simulados. Nenhum valor é dinheiro real e nenhum prêmio é
        pago.
      </div>

      <div className="saldoBox">
        {account.username} — saldo <strong>{fmtBRL(balance)}</strong>
      </div>

      <section className="admCard">
        <h2>Depositar</h2>
        <p className="muted">Credita saldo fictício para apostar.</p>
        <Link to="/deposito" className="btn" style={{ maxWidth: 240 }}>
          Ir para depósito (PIX simulado)
        </Link>
      </section>

      <section className="admCard">
        <h2>Chave PIX (fictícia)</h2>
        <p className="contaWarn">
          ⚠️ Não digite sua chave PIX real. Isto é uma simulação, o valor fica só guardado como texto e nenhum prêmio
          é pago.
        </p>
        <div className="checkTicket">
          <input
            value={pix}
            onChange={(e) => setPixInput(e.target.value)}
            placeholder="ex.: chave-ficticia-123"
            maxLength={80}
          />
          <button type="button" className="btn" onClick={savePix}>
            Salvar
          </button>
        </div>
      </section>

      <section className="admCard">
        <h2>Solicitar saque (simulado)</h2>
        <p className="muted">Abate do saldo fictício e registra um pedido. Nada é pago de verdade.</p>
        <div className="checkTicket">
          <input
            type="number"
            min="1"
            value={wAmount}
            onChange={(e) => setWAmount(e.target.value)}
            placeholder="Valor (R$)"
          />
          <button type="button" className="btn" onClick={requestWithdraw}>
            Solicitar
          </button>
        </div>
      </section>

      {msg && <div className="infoBar">{msg}</div>}
      {err && <div className="formError">{err}</div>}

      <section className="admCard">
        <h2>Histórico de apostas</h2>
        {bets === null && <p className="muted">Carregando…</p>}
        {bets && bets.length === 0 && <p className="muted">Você ainda não fez apostas.</p>}
        {bets && bets.length > 0 && (
          <div className="admTableWrap">
            <table className="tableTicket">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Data</th>
                  <th>Palpites</th>
                  <th>Valor</th>
                  <th>Cotação</th>
                  <th>Retorno</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((b) => {
                  const sels = Array.isArray(b.selections) ? b.selections : [];
                  const first = sels[0];
                  return (
                    <tr key={b.code}>
                      <td>
                        <Link className="mono" to={`/conferir-bilhete?codigo=${b.code}`}>
                          {b.code}
                        </Link>
                      </td>
                      <td>{fmtDateTime(b.created_at)}</td>
                      <td>
                        {first ? first.match : '—'}
                        {sels.length > 1 && <span className="muted"> +{sels.length - 1}</span>}
                      </td>
                      <td>{fmtBRL(Number(b.stake))}</td>
                      <td>{fmtOdd(Number(b.total_odd))}</td>
                      <td>{fmtBRL(Number(b.possible_return))}</td>
                      <td>{b.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
