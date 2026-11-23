import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMatches, usingRealApi } from '../api/odds.js';
import EventList from '../components/EventList.jsx';
import { leagueById, SPORTS, sportById } from '../data/leagues.js';
import { dayName } from '../format.js';
import useIsMobile from '../hooks/useIsMobile.js';
import MobileEventList from '../mobile/MobileEventList.jsx';

export default function Jogos({ home = false }) {
  const mobile = useIsMobile();
  const [params] = useSearchParams();
  const sportId = params.get('esporte') || 'futebol';
  const leagueId = params.get('liga');
  const dayParam = params.get('dia');
  const day = leagueId ? null : dayParam !== null ? Number(dayParam) : home ? 0 : null;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getMatches({ sportId, leagueId, day })
      .then((list) => alive && setMatches(list))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [sportId, leagueId, day]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((m) => `${m.home} ${m.away} ${m.leagueName} ${m.country}`.toLowerCase().includes(q));
  }, [matches, search]);

  const league = leagueId ? leagueById(leagueId) : null;
  const sport = sportById(sportId);
  const heading = league ? league.name : day !== null ? dayName(day) : sport?.name;

  const status = (
    <>
      {loading && <div className="loading"><span className="spinner" /> Carregando...</div>}
      {error && <div className="formError">Não foi possível carregar os jogos: {error}</div>}
    </>
  );

  if (mobile) {
    return (
      <div className="m-jogos">
        <div className="m-title">
          <h1>{heading}</h1>
          <span>Jogos disponíveis: {loading ? '…' : filtered.length}</span>
        </div>
        {home && (
          <div className="m-sports">
            {SPORTS.map((s) => (
              <Link key={s.id} to={`/jogos?esporte=${s.id}&dia=0`} className={`m-sport ${s.id === sportId ? 'active' : ''}`}>
                <span>{s.icon}</span>
                {s.name}
              </Link>
            ))}
          </div>
        )}
        <div className="m-search">
          <input
            type="search"
            placeholder="Encontre partidas e campeonatos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="m-search-clear" onClick={() => setSearch('')} aria-label="Limpar busca">
              ✕
            </button>
          )}
          <button type="button" className="m-search-button" aria-label="Pesquisar">
            🔍
          </button>
        </div>
        {status}
        {!loading && !error && <MobileEventList matches={filtered} />}
        {!usingRealApi && home && !loading && <p className="m-demo">Dados de exemplo · demonstração sem dinheiro real</p>}
      </div>
    );
  }

  return (
    <div className="contentBets">
      {home && (
        <div className="carroselSports">
          {SPORTS.map((s) => (
            <Link key={s.id} to={`/jogos?esporte=${s.id}&dia=0`} className={`sportItem ${s.id === sportId ? 'active' : ''}`}>
              <span className="sportIcon">{s.icon}</span>
              <span>{s.name}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="titlePage">
        <h1>{league ? `${league.country} - ${league.name}` : `${heading} - Jogos Disponíveis (${filtered.length})`}</h1>
        <input
          className="searchInput"
          type="search"
          placeholder="Pesquisar time ou campeonato"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {!usingRealApi && home && (
        <div className="infoBar">Dados de exemplo. Defina VITE_ODDS_API_KEY no arquivo .env para usar odds reais.</div>
      )}
      {status}
      {!loading && !error && <EventList matches={filtered} />}
    </div>
  );
}
