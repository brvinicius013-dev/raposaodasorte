import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBetSlip } from '../context/BetSlipContext.jsx';
import { SPORTS } from '../data/leagues.js';
import { fmtBRL } from '../format.js';

function Item({ to, icon, children }) {
  return (
    <Link className="m-menu-item" to={to}>
      <span className="m-menu-icon">{icon}</span>
      <span className="name">{children}</span>
    </Link>
  );
}

export default function MobileMenu() {
  const { user, setUser, balance } = useBetSlip();
  const [moreOpen, setMoreOpen] = useState(false);
  const [futebol, ...others] = SPORTS;

  return (
    <div className="m-menu">
      <div className="m-menu-box">
        <Link className="m-menu-balance" to="/deposito">
          <span>
            Saldo <strong>{fmtBRL(balance)}</strong>
          </span>
          <span className="m-menu-deposit">+ Depositar</span>
        </Link>
        <Item to="/" icon="🏠">Início</Item>
        <Item to={`/campeonatos?esporte=${futebol.id}`} icon={futebol.icon}>Futebol</Item>
        <Item to="/ao-vivo" icon={<span className="liveDot" />}>Ao Vivo</Item>
        <div className="m-menu-drop">
          <button type="button" className="m-menu-drop-main" onClick={() => setMoreOpen((o) => !o)}>
            <span className="m-menu-icon">➕</span>
            <span className="name">Mais Esportes</span>
            <span className={`m-chevron ${moreOpen ? 'up' : ''}`}>▾</span>
          </button>
          {moreOpen && (
            <div className="m-menu-drop-second">
              {others.map((s) => (
                <Link key={s.id} className="m-menu-drop-item" to={`/campeonatos?esporte=${s.id}`}>
                  <span className="m-menu-icon">{s.icon}</span>
                  <span className="name">{s.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <Item to="/regulamento" icon="📄">Regulamento</Item>
        <Item to="/conferir-bilhete" icon="🎫">Conferir Bilhete</Item>
        {user ? (
          <div className="m-menu-user">
            <span>Olá, {user.name}</span>
            <button type="button" onClick={() => setUser(null)}>
              Sair
            </button>
          </div>
        ) : (
          <Link className="m-menu-login" to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
