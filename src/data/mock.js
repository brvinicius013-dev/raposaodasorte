import { LEAGUES, sportById } from './leagues.js';

// Gerador pseudoaleatório com semente: os mesmos jogos aparecem a cada recarga no mesmo dia.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Odds entre 1,01 e 51,00 (teto comum nas casas de aposta)
const round2 = (n) => Math.min(51, Math.max(1.01, Math.round(n * 100) / 100));

// Converte força dos times em odds decimais com margem da casa.
export function oddsFromStrength(home, away, hasDraw, margin = 1.07) {
  const diff = home + 0.25 - away; // vantagem de mando
  const pHomeRaw = 1 / (1 + Math.exp(-diff * 1.6));
  if (!hasDraw) {
    return { home: round2(1 / (pHomeRaw * margin)), away: round2(1 / ((1 - pHomeRaw) * margin)) };
  }
  const pDraw = 0.29 - Math.min(0.12, Math.abs(diff) * 0.08);
  const pHome = pHomeRaw * (1 - pDraw);
  const pAway = (1 - pHomeRaw) * (1 - pDraw);
  return {
    home: round2(1 / (pHome * margin)),
    draw: round2(1 / (pDraw * margin)),
    away: round2(1 / (pAway * margin)),
  };
}

function dayStart(offset = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

let cached = null;
let cachedKey = '';

export function mockMatches() {
  const key = dayStart(0).toDateString();
  if (cached && cachedKey === key) return cached;

  const out = [];
  const now = Date.now();

  for (const league of LEAGUES) {
    const sport = sportById(league.sport);
    for (let day = 0; day < 3; day++) {
      const rand = mulberry32(hash(`${key}|${league.id}|${day}`));
      const teams = [...league.teams].sort(() => rand() - 0.5);
      const count = 2 + Math.floor(rand() * Math.min(5, teams.length / 2 - 1));
      for (let i = 0; i < count; i++) {
        const home = teams[i * 2];
        const away = teams[i * 2 + 1];
        const start = dayStart(day);
        start.setHours(11 + Math.floor(rand() * 11), rand() < 0.5 ? 0 : 30);
        const sHome = hash(home) % 100 / 100 + rand() * 0.6;
        const sAway = hash(away) % 100 / 100 + rand() * 0.6;
        const id = `m${hash(`${key}|${league.id}|${day}|${i}`)}`;
        const startedMin = Math.floor((now - start.getTime()) / 60000);
        // Só futebol tem simulação ao vivo; nos outros esportes, jogo iniciado sai da lista.
        const isFootball = league.sport === 'futebol';
        const isLive = isFootball && startedMin >= 0 && startedMin < 105;
        const isOver = isFootball ? startedMin >= 105 : startedMin >= 0;
        out.push({
          id,
          sport: league.sport,
          hasDraw: sport.hasDraw,
          leagueId: league.id,
          leagueName: league.name,
          country: league.country,
          flag: league.flag,
          home,
          away,
          start: start.toISOString(),
          odds: oddsFromStrength(sHome, sAway, sport.hasDraw),
          strength: { home: sHome, away: sAway },
          marketsCount: sport.hasDraw ? 120 + Math.floor(rand() * 400) : 20 + Math.floor(rand() * 60),
          live: isLive
            ? { minute: Math.min(90, startedMin), scoreHome: Math.floor(rand() * 3), scoreAway: Math.floor(rand() * 2) }
            : null,
          finished: isOver,
          source: 'mock',
        });
      }
    }
  }

  out.sort((a, b) => a.start.localeCompare(b.start));
  cached = out;
  cachedKey = key;
  return out;
}

// Jogos "ao vivo" garantidos para a página Ao Vivo (mesmo fora do horário dos jogos de exemplo).
export function mockLiveMatches() {
  const all = mockMatches();
  const live = all.filter((m) => m.live);
  if (live.length >= 6) return live;
  const rand = mulberry32(hash(dayStart(0).toDateString() + 'live'));
  const extra = all
    .filter((m) => !m.live && !m.finished && m.sport === 'futebol')
    .slice(0, 8 - live.length)
    .map((m) => ({
      ...m,
      id: `${m.id}-live`,
      live: { minute: 5 + Math.floor(rand() * 80), scoreHome: Math.floor(rand() * 3), scoreAway: Math.floor(rand() * 3) },
    }));
  return [...live, ...extra];
}

// Ajusta as odds conforme placar e minuto (usado na página Ao Vivo).
export function liveOdds(match) {
  const { minute, scoreHome, scoreAway } = match.live;
  const goalDiff = scoreHome - scoreAway;
  const timeFactor = 1 + (minute / 90) * 1.4;
  const base = match.strength.home - match.strength.away;
  const effective = (base + goalDiff * 0.6) * timeFactor;
  return oddsFromStrength(effective / 2, -effective / 2, match.hasDraw, 1.08);
}

// Mercados adicionais derivados das odds principais (página da partida).
export function deriveMarkets(match) {
  const { home, draw, away } = match.odds;
  const p = (o) => 1 / o;
  const m = 1.07;
  const odd = (prob) => round2(1 / (Math.min(0.97, Math.max(0.012, prob)) * m));
  const pH = p(home) / m;
  const pA = p(away) / m;
  const pD = draw ? p(draw) / m : 0;

  const markets = [];
  if (match.hasDraw) {
    markets.push({
      id: 'dupla', name: 'Dupla Chance',
      picks: [
        { id: '1X', label: `${match.home} ou Empate`, odd: odd(pH + pD) },
        { id: '12', label: `${match.home} ou ${match.away}`, odd: odd(pH + pA) },
        { id: 'X2', label: `Empate ou ${match.away}`, odd: odd(pD + pA) },
      ],
    });
    const attack = 2.2 + Math.abs(match.strength.home - match.strength.away);
    const lines = [0.5, 1.5, 2.5, 3.5, 4.5];
    markets.push({
      id: 'gols', name: 'Total de Gols',
      picks: lines.flatMap((line) => {
        // Probabilidade de mais de `line` gols por Poisson
        let under = 0;
        for (let k = 0; k <= Math.floor(line); k++) under += (Math.exp(-attack) * attack ** k) / factorial(k);
        return [
          { id: `over${line}`, label: `Mais de ${line}`, odd: odd(1 - under) },
          { id: `under${line}`, label: `Menos de ${line}`, odd: odd(under) },
        ];
      }),
    });
    const pBtts = 0.35 + Math.min(0.25, (attack - 2.2) * 0.2);
    markets.push({
      id: 'ambas', name: 'Ambas Marcam',
      picks: [
        { id: 'sim', label: 'Sim', odd: odd(pBtts + 0.15) },
        { id: 'nao', label: 'Não', odd: odd(0.85 - pBtts) },
      ],
    });
    markets.push({
      id: 'intervalo', name: 'Resultado no Intervalo',
      picks: [
        { id: '1', label: match.home, odd: odd(pH * 0.75) },
        { id: 'X', label: 'Empate', odd: odd(0.42) },
        { id: '2', label: match.away, odd: odd(pA * 0.75) },
      ],
    });
    const scores = [];
    for (let h = 0; h <= 3; h++) {
      for (let a = 0; a <= 3; a++) {
        const lh = 1.1 + (pH - pA) * 1.2;
        const la = 1.1 - (pH - pA) * 1.2;
        const prob = ((Math.exp(-lh) * lh ** h) / factorial(h)) * ((Math.exp(-la) * la ** a) / factorial(a));
        scores.push({ id: `${h}-${a}`, label: `${h} x ${a}`, odd: odd(prob * 0.9) });
      }
    }
    markets.push({ id: 'placar', name: 'Placar Exato', picks: scores });
  } else {
    markets.push({
      id: 'handicap', name: 'Handicap',
      picks: [
        { id: 'h-1.5', label: `${match.home} -1.5`, odd: odd(pH * 0.7) },
        { id: 'a+1.5', label: `${match.away} +1.5`, odd: odd(1 - pH * 0.7) },
        { id: 'h+1.5', label: `${match.home} +1.5`, odd: odd(Math.min(0.95, pH * 1.3)) },
        { id: 'a-1.5', label: `${match.away} -1.5`, odd: odd(1 - Math.min(0.95, pH * 1.3)) },
      ],
    });
  }
  return markets;
}

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
