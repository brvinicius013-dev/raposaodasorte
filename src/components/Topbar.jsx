import { Link, NavLink } from 'react-router-dom';
import { useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtBRL } from '../format.js';
import Logo from './Logo.jsx';

export default function Topbar({ onMenu }) {
  const { user, setUser, balance } = useBetSlip();
  return (
    <header className="header">
      <button type="button" className="hamburger" onClick={onMenu} aria-label="Abrir menu">
        ☰
      </button>
      <Link to="/" className="headerLogoMobile">
        <Logo />
      </Link>
      <NavLink to="/" end className="headerHome">
        Início
      </NavLink>
      <nav className="headerLinks">
        <NavLink to="/regulamento">Regulamento</NavLink>
        <NavLink to="/conferir-bilhete">Conferir Bilhete</NavLink>
        <Link to="/deposito" className="headerBalance" title="Saldo de demonstração">
          {fmtBRL(balance)}
          <span className="headerDeposit">+ Depositar</span>
        </Link>
        {user ? (
          <span className="headerUser">
            <span>Olá, {user.name}</span>
            <button type="button" onClick={() => setUser(null)}>
              Sair
            </button>
          </span>
        ) : (
          <NavLink to="/login" className="btnLogin">
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
}
