import { Link } from 'react-router-dom';
import { useBetSlip } from '../context/BetSlipContext.jsx';
import { fmtDate, fmtHour, fmtOdd } from '../format.js';
import Flag from './Flag.jsx';
import TeamLogo from './TeamLogo.jsx';

const MAIN = { id: '1x2', name: 'Resultado Final' };

export function OddButton({ match, marketId, marketName, pickId, pickLabel, odd, children }) {
  const { toggle, isSelected } = useBetSlip();
  const selected = isSelected(match.id, marketId, pickId);
  return (
    <button
      type="button"
      className={`odd ${selected ? 'selected' : ''}`}
      disabled={!odd}
      onClick={() => toggle({ matchId: match.id, match, marketId, marketName, pickId, pickLabel, odd })}
    >
      {children ?? fmtOdd(odd)}
    </button>
  );
}

export function MatchCard({ match }) {
  const cols = match.hasDraw ? 3 : 2;
  return (
    <div className={`cardItem cardItem${cols}`}>
      <div className="dateAndHour">
        {match.live ? (
          <>
            <span className="liveBadge">AO VIVO</span>
            <span className="hour">{match.live.minute != null ? `${match.live.minute}'` : ''}</span>
          </>
        ) : (
          <>
            <span className="date">{fmtDate(match.start)}</span>
            <span className="hour">{fmtHour(match.start)}</span>
          </>
        )}
      </div>
      <div className="teams">
        {[
          ['home', match.home, match.live?.scoreHome],
          ['away', match.away, match.live?.scoreAway],
        ].map(([side, name, score]) => (
          <div className="team" key={side}>
            <TeamLogo name={name} />
            <span className="nameTeam">{name}</span>
            {score != null && <span className="score">{score}</span>}
          </div>
        ))}
      </div>
      <div className={`boxOdds boxOdds${cols}`}>
        <OddButton match={match} marketId={MAIN.id} marketName={MAIN.name} pickId="1" pickLabel={match.home} odd={match.odds.home} />
        {match.hasDraw && (
          <OddButton match={match} marketId={MAIN.id} marketName={MAIN.name} pickId="X" pickLabel="Empate" odd={match.odds.draw} />
        )}
        <OddButton match={match} marketId={MAIN.id} marketName={MAIN.name} pickId="2" pickLabel={match.away} odd={match.odds.away} />
      </div>
      <div className="totalOutcomes">
        <Link className="totalOutcomes-button" to={`/partida/${match.id}`}>
          +{match.marketsCount}
        </Link>
      </div>
    </div>
  );
}

export default function EventList({ matches }) {
  const groups = [];
  const index = new Map();
  for (const m of matches) {
    if (!index.has(m.leagueId)) {
      index.set(m.leagueId, groups.length);
      groups.push({ league: m, items: [] });
    }
    groups[index.get(m.leagueId)].items.push(m);
  }

  if (!matches.length) {
    return <div className="semEventos">Nenhum evento disponível no momento.</div>;
  }

  return (
    <div className="eventlistContainer">
      {groups.map(({ league, items }) => {
        const cols = league.hasDraw ? 3 : 2;
        return (
          <section className="pais" key={league.leagueId}>
            <div className="eventlist-country">
              <span className="boxFlag"><Flag code={league.flag} /></span>
              <span className="name">
                {league.country} - {league.leagueName}
              </span>
              <div className={`titleMarkets titleMarkets${cols}`}>
                <span className="item">Casa</span>
                {league.hasDraw && <span className="item">Empate</span>}
                <span className="item">Fora</span>
                <span className="item spacer" />
              </div>
            </div>
            <div className="eventlist-events">
              {items.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
