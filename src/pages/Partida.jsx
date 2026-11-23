import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMatchById } from '../api/odds.js';
import { OddButton } from '../components/EventList.jsx';
import Flag from '../components/Flag.jsx';
import TeamLogo from '../components/TeamLogo.jsx';
import { deriveMarkets } from '../data/mock.js';
import { fmtDateTime, fmtOdd } from '../format.js';

export default function Partida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(undefined);

  useEffect(() => {
    getMatchById(id).then(setMatch);
  }, [id]);

  if (match === undefined) return <div className="loading"><span className="spinner" /> Carregando...</div>;
  if (match === null) return <div className="semEventos">Partida não encontrada.</div>;

  const main = {
    id: '1x2',
    name: 'Resultado Final',
    picks: [
      { id: '1', label: match.home, odd: match.odds.home },
      ...(match.hasDraw ? [{ id: 'X', label: 'Empate', odd: match.odds.draw }] : []),
      { id: '2', label: match.away, odd: match.odds.away },
    ],
  };
  const markets = [main, ...deriveMarkets(match)];

  return (
    <div className="contentBets eventdetail">
      <button type="button" className="backLink" onClick={() => navigate(-1)}>
        ‹ Voltar
      </button>
      <div className="eventdetail-info">
        <div className="eventdetail-league">
          <Flag code={match.flag} /> {match.country} - {match.leagueName}
        </div>
        <div className="eventdetail-teams">
          <div className="side">
            <TeamLogo name={match.home} size={48} />
            <span>{match.home}</span>
          </div>
          <div className="vs">
            {match.live ? (
              <>
                <strong className="liveScore">
                  {match.live.scoreHome ?? '-'} : {match.live.scoreAway ?? '-'}
                </strong>
                <span className="liveBadge">AO VIVO</span>
              </>
            ) : (
              <>
                <span>x</span>
                <small>{fmtDateTime(match.start)}</small>
              </>
            )}
          </div>
          <div className="side">
            <TeamLogo name={match.away} size={48} />
            <span>{match.away}</span>
          </div>
        </div>
      </div>

      {markets.map((mk) => (
        <section className="eventdetail-market" key={mk.id}>
          <div className="eventdetail-market-header">{mk.name}</div>
          <div className={`eventdetail-market-body cols${mk.picks.length % 3 === 0 ? 3 : 2}`}>
            {mk.picks.map((p) => (
              <OddButton
                key={p.id}
                match={match}
                marketId={mk.id}
                marketName={mk.name}
                pickId={p.id}
                pickLabel={mk.id === '1x2' ? p.label : `${p.label}`}
                odd={p.odd}
              >
                <span className="nameOption">{p.label}</span>
                <strong>{fmtOdd(p.odd)}</strong>
              </OddButton>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
