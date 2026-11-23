import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { LEAGUES, SPORTS } from '../data/leagues.js';
import { dayName } from '../format.js';
import Flag from './Flag.jsx';
import Logo from './Logo.jsx';

function Submenu({ title, flag, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`submenuItem ${open ? 'open' : ''}`}>
      <button type="button" className="submenuItem-main" onClick={() => setOpen((o) => !o)}>
        <span className="boxFlag">{typeof flag === 'string' ? <Flag code={flag} /> : flag}</span>
        <span className="name">{title}</span>
        <span className="arrow">▾</span>
      </button>
      {open && <div className="submenuItem-level3">{children}</div>}
    </div>
  );
}

function SportMenu({ sport, defaultOpen, onNavigate }) {
  const [open, setOpen] = useState(defaultOpen);
  const [params] = useSearchParams();
  const location = useLocation();
  const activeLeague = location.pathname === '/jogos' ? params.get('liga') : null;
  const activeDay = location.pathname === '/jogos' && params.get('esporte') === sport.id ? params.get('dia') : null;

  const byCountry = useMemo(() => {
    const groups = new Map();
    for (const l of LEAGUES.filter((x) => x.sport === sport.id)) {
      if (!groups.has(l.country)) groups.set(l.country, { flag: l.flag, leagues: [] });
      groups.get(l.country).leagues.push(l);
    }
    return [...groups.entries()];
  }, [sport.id]);

  return (
    <div className="menuMulti">
      <button type="button" className={`menuMulti-main ${open ? 'menuSelected' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="icon">{sport.icon}</span>
        <span className="name">{sport.name}</span>
        <span className="arrow">▾</span>
      </button>
      {open && (
        <div className="menuMulti-submenu">
          <Submenu title="Jogos do Dia" flag={<span className="flagGlobe">📅</span>} defaultOpen={sport.id === 'futebol'}>
            {[0, 1, 2].map((d) => (
              <Link
                key={d}
                to={`/jogos?esporte=${sport.id}&dia=${d}`}
                className={`submenuItem-level3-item ${activeDay === String(d) ? 'active' : ''}`}
                onClick={onNavigate}
              >
                {dayName(d)}
              </Link>
            ))}
          </Submenu>
          {byCountry.map(([country, { flag, leagues }]) => (
            <Submenu key={country} title={country} flag={flag} defaultOpen={leagues.some((l) => l.id === activeLeague)}>
              {leagues.map((l) => (
                <Link
                  key={l.id}
                  to={`/jogos?esporte=${sport.id}&liga=${l.id}`}
                  className={`submenuItem-level3-item ${activeLeague === l.id ? 'active' : ''}`}
                  onClick={onNavigate}
                >
                  {l.name}
                </Link>
              ))}
            </Submenu>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const [futebol, ...others] = SPORTS;
  return (
    <>
      <div className={`sidebarBackdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="logo">
          <Link to="/" onClick={onClose}>
            <Logo />
          </Link>
        </div>
        <nav className="menu">
          <NavLink to="/" end className="menuSingle" onClick={onClose}>
            <span className="icon">🏠</span>
            <span className="name">Início</span>
          </NavLink>
          <SportMenu sport={futebol} defaultOpen onNavigate={onClose} />
          <NavLink to="/ao-vivo" className="menuSingle" onClick={onClose}>
            <span className="icon liveDot" />
            <span className="name">Ao Vivo</span>
          </NavLink>
          <div className="menuTitle">Mais Esportes</div>
          {others.map((s) => (
            <SportMenu key={s.id} sport={s} defaultOpen={false} onNavigate={onClose} />
          ))}
          <NavLink to="/conferir-bilhete" className="menuSingle" onClick={onClose}>
            <span className="icon">🎫</span>
            <span className="name">Conferir Bilhete</span>
          </NavLink>
          <NavLink to="/regulamento" className="menuSingle" onClick={onClose}>
            <span className="icon">📄</span>
            <span className="name">Regulamento</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
