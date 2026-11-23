import { useEffect, useState } from 'react';
import { getLiveMatches } from '../api/odds.js';
import EventList from '../components/EventList.jsx';
import { liveOdds } from '../data/mock.js';
import useIsMobile from '../hooks/useIsMobile.js';
import MobileEventList from '../mobile/MobileEventList.jsx';

// Simula a partida avançando: minuto sobe, gols acontecem e as odds se ajustam.
function tick(m) {
  const minute = Math.min(90, m.live.minute + 1);
  let { scoreHome, scoreAway } = m.live;
  const r = Math.random();
  if (minute < 90 && r < 0.025 + m.strength.home * 0.01) scoreHome++;
  else if (minute < 90 && r > 0.975 - m.strength.away * 0.01) scoreAway++;
  const next = { ...m, live: { minute, scoreHome, scoreAway } };
  return { ...next, odds: liveOdds(next) };
}

export default function AoVivo() {
  const mobile = useIsMobile();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    getLiveMatches().then((list) => setMatches(list.map((m) => ({ ...m, odds: liveOdds(m) }))));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setMatches((list) => list.map(tick)), 4000);
    return () => clearInterval(id);
  }, []);

  if (mobile) {
    return (
      <div className="m-jogos">
        <div className="m-title">
          <h1>
            <span className="liveDot" /> Ao Vivo
          </h1>
          <span>Jogos disponíveis: {matches.length}</span>
        </div>
        <MobileEventList matches={matches} />
      </div>
    );
  }

  return (
    <div className="contentBets">
      <div className="titlePage">
        <h1>
          <span className="liveDot" /> Ao Vivo ({matches.length})
        </h1>
      </div>
      <EventList matches={matches} />
    </div>
  );
}
