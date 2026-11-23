import { useNavigate } from 'react-router-dom';
import { OddButton } from '../components/EventList.jsx';
import Flag from '../components/Flag.jsx';
import TeamLogo from '../components/TeamLogo.jsx';
import { fmtDate, fmtHour } from '../format.js';

const MAIN = { id: '1x2', name: 'Resultado Final' };

function MobileMatch({ match }) {
  const navigate = useNavigate();
  const cols = match.hasDraw ? 3 : 2;
  const open = () => navigate(`/partida/${match.id}`);
  return (
    <div className="m-item">
      <div className={`m-item-info m-tpl${cols}`}>
        <div className="m-item-teams" onClick={open} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open()}>
          {[
            [match.home, match.live?.scoreHome],
            [match.away, match.live?.scoreAway],
          ].map(([name, score]) => (
            <div className="m-team" key={name}>
              <TeamLogo name={name} size={25} />
              <span className="m-team-name">{name}</span>
              {score != null && <span className="m-score">{score}</span>}
            </div>
          ))}
        </div>
        <div className="m-item-options">
          <OddButton match={match} marketId={MAIN.id} marketName={MAIN.name} pickId="1" pickLabel={match.home} odd={match.odds.home} />
          {match.hasDraw && (
            <OddButton match={match} marketId={MAIN.id} marketName={MAIN.name} pickId="X" pickLabel="Empate" odd={match.odds.draw} />
          )}
          <OddButton match={match} marketId={MAIN.id} marketName={MAIN.name} pickId="2" pickLabel={match.away} odd={match.odds.away} />
        </div>
      </div>
      <div className="m-item-legend" onClick={open}>
        {match.live ? (
          <span className="m-date">
            <span className="liveBadge">AO VIVO</span> {match.live.minute != null ? `${match.live.minute}'` : ''}
          </span>
        ) : (
          <span className="m-date">
            <span className="m-clock">🕓</span>
            {fmtDate(match.start)} {fmtHour(match.start)}
          </span>
        )}
        <span className="m-outcomes">+{match.marketsCount}</span>
      </div>
    </div>
  );
}

// Lista agrupada por país e, dentro dele, por campeonato (como no layout mobile do original).
export default function MobileEventList({ matches }) {
  if (!matches.length) return <div className="semEventos m-empty">Nenhum evento disponível no momento.</div>;

  const countries = [];
  const cIndex = new Map();
  for (const m of matches) {
    if (!cIndex.has(m.country)) {
      cIndex.set(m.country, countries.length);
      countries.push({ country: m.country, flag: m.flag, leagues: new Map() });
    }
    const c = countries[cIndex.get(m.country)];
    if (!c.leagues.has(m.leagueId)) c.leagues.set(m.leagueId, { name: m.leagueName, hasDraw: m.hasDraw, items: [] });
    c.leagues.get(m.leagueId).items.push(m);
  }

  return (
    <div className="m-eventlist">
      {countries.map((c) => (
        <section className="m-country" key={c.country}>
          <div className="m-country-header">
            <Flag code={c.flag} />
            <span>{c.country}</span>
          </div>
          {[...c.leagues.entries()].map(([id, lg]) => (
            <div className="m-league" key={id}>
              <div className="m-league-header">
                <span className="name">{lg.name}</span>
                <div className={`m-legend m-tpl${lg.hasDraw ? 3 : 2}`}>
                  <div>Casa</div>
                  {lg.hasDraw && <div>Emp.</div>}
                  <div>Fora</div>
                </div>
              </div>
              {lg.items.map((m) => (
                <MobileMatch key={m.id} match={m} />
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
