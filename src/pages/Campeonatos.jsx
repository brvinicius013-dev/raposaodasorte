import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Flag from '../components/Flag.jsx';
import { leaguesOfSport, sportById } from '../data/leagues.js';
import { dayName } from '../format.js';

// Lista de campeonatos de um esporte (entrada do menu mobile).
export default function Campeonatos() {
  const [params] = useSearchParams();
  const sportId = params.get('esporte') || 'futebol';
  const sport = sportById(sportId) || sportById('futebol');
  const [open, setOpen] = useState(null);

  const countries = useMemo(() => {
    const map = new Map();
    for (const l of leaguesOfSport(sport.id)) {
      if (!map.has(l.country)) map.set(l.country, { flag: l.flag, leagues: [] });
      map.get(l.country).leagues.push(l);
    }
    return [...map.entries()];
  }, [sport.id]);

  return (
    <div className="m-campeonatos">
      <div className="m-title">
        <h1>
          {sport.icon} {sport.name}
        </h1>
        <span>Escolha um dia ou campeonato</span>
      </div>
      <div className="m-days">
        {[0, 1, 2].map((d) => (
          <Link key={d} className="m-day" to={`/jogos?esporte=${sport.id}&dia=${d}`}>
            <small>{d === 0 ? 'Hoje' : d === 1 ? 'Amanhã' : 'Depois'}</small>
            <strong>{dayName(d)}</strong>
          </Link>
        ))}
      </div>
      {countries.map(([country, { flag, leagues }]) => (
        <div className="m-menu-drop" key={country}>
          <button type="button" className="m-menu-drop-main" onClick={() => setOpen(open === country ? null : country)}>
            <span className="m-menu-icon">
              <Flag code={flag} />
            </span>
            <span className="name">{country}</span>
            <span className="m-count">{leagues.length}</span>
            <span className={`m-chevron ${open === country ? 'up' : ''}`}>▾</span>
          </button>
          {open === country && (
            <div className="m-menu-drop-second">
              {leagues.map((l) => (
                <Link key={l.id} className="m-menu-drop-item" to={`/jogos?esporte=${sport.id}&liga=${l.id}`}>
                  <span className="name">{l.name}</span>
                  <span className="m-arrow">›</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
