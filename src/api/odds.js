// Camada de dados. Com VITE_ODDS_API_KEY definida, busca odds reais da The Odds API
// (https://the-odds-api.com, plano gratuito de 500 requisições/mês). Sem ela, usa dados de exemplo.
import { LEAGUES, leagueById, leaguesOfSport, sportById } from '../data/leagues.js';
import { mockMatches, mockLiveMatches } from '../data/mock.js';

// Três modos:
// 1) DIRECT_KEY (dev local, .env): chama a The Odds API direto do navegador.
// 2) USE_PROXY (site publicado): chama /api/odds, uma função serverless que guarda a chave no servidor.
// 3) sem nada: dados de exemplo.
const DIRECT_KEY = import.meta.env.VITE_ODDS_API_KEY;
const USE_PROXY = !DIRECT_KEY && import.meta.env.PROD;
const BASE = 'https://api.the-odds-api.com/v4';
const CACHE_MS = 5 * 60 * 1000;

export const usingRealApi = Boolean(DIRECT_KEY) || USE_PROXY;
let proxyDisabled = false; // vira true se o servidor não tiver ODDS_API_KEY

const cache = new Map(); // leagueId -> { t, data }
const byId = new Map(); // matchId -> match

function remember(list) {
  for (const m of list) byId.set(m.id, m);
  return list;
}

function average(nums) {
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function normalize(ev, league) {
  const sport = sportById(league.sport);
  const prices = { home: [], draw: [], away: [] };
  for (const bk of ev.bookmakers || []) {
    const h2h = bk.markets?.find((mk) => mk.key === 'h2h');
    if (!h2h) continue;
    for (const o of h2h.outcomes) {
      if (o.name === ev.home_team) prices.home.push(o.price);
      else if (o.name === ev.away_team) prices.away.push(o.price);
      else if (o.name === 'Draw') prices.draw.push(o.price);
    }
  }
  if (!prices.home.length || !prices.away.length) return null;
  const hasDraw = sport.hasDraw && prices.draw.length > 0;
  const odds = { home: average(prices.home), away: average(prices.away) };
  if (hasDraw) odds.draw = average(prices.draw);
  const pH = 1 / odds.home;
  const pA = 1 / odds.away;
  return {
    id: `api-${ev.id}`,
    sport: league.sport,
    hasDraw,
    leagueId: league.id,
    leagueName: league.name,
    country: league.country,
    flag: league.flag,
    home: ev.home_team,
    away: ev.away_team,
    start: ev.commence_time,
    odds,
    strength: { home: pH * 2, away: pA * 2 },
    marketsCount: (ev.bookmakers || []).length,
    live: new Date(ev.commence_time).getTime() < Date.now() ? { minute: null, scoreHome: null, scoreAway: null } : null,
    finished: false,
    source: 'api',
  };
}

async function fetchLeagueFromApi(league) {
  const hit = cache.get(league.id);
  if (hit && Date.now() - hit.t < CACHE_MS) return hit.data;
  const url = DIRECT_KEY
    ? `${BASE}/sports/${league.apiKey}/odds/?apiKey=${DIRECT_KEY}&regions=eu&markets=h2h&oddsFormat=decimal`
    : `/api/odds?sport=${league.apiKey}`;
  const res = await fetch(url);
  if (res.status === 503) {
    proxyDisabled = true; // proxy sem chave configurada → cai para dados de exemplo
    return [];
  }
  if (res.status === 404 || res.status === 422) {
    cache.set(league.id, { t: Date.now(), data: [] }); // campeonato fora de temporada
    return [];
  }
  if (!res.ok) throw new Error(`Odds API respondeu ${res.status}`);
  const json = await res.json();
  const data = remember(json.map((ev) => normalize(ev, league)).filter(Boolean));
  cache.set(league.id, { t: Date.now(), data });
  return data;
}

function sameDay(iso, dayOffset) {
  const d = new Date(iso);
  const ref = new Date();
  ref.setHours(0, 0, 0, 0);
  ref.setDate(ref.getDate() + dayOffset);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

/**
 * Lista jogos por esporte, campeonato e dia (0 = hoje, 1 = amanhã, 2 = depois; null = todos).
 */
export async function getMatches({ sportId = 'futebol', leagueId = null, day = null } = {}) {
  let list;
  const scopeMock = () =>
    mockMatches().filter((m) => (leagueId ? m.leagueId === leagueId : m.sport === sportId));
  if (usingRealApi && !proxyDisabled) {
    try {
      const leagues = leagueId
        ? [leagueById(leagueId)]
        : leaguesOfSport(sportId).filter((l) => l.apiKey).slice(0, 3); // economiza cota
      const real = leagues.filter((l) => l?.apiKey);
      const results = await Promise.all(real.map(fetchLeagueFromApi));
      list = results.flat();
      // Campeonatos sem cobertura na API continuam com dados de exemplo
      const mockOnly = leagues.filter((l) => l && !l.apiKey).map((l) => l.id);
      if (mockOnly.length) list = list.concat(mockMatches().filter((m) => mockOnly.includes(m.leagueId)));
      if (proxyDisabled) throw new Error('proxy-sem-chave');
    } catch (e) {
      // No site publicado (proxy), qualquer falha degrada para dados de exemplo em vez de erro.
      if (USE_PROXY) list = scopeMock();
      else throw e; // dev local com chave inválida → mostra o erro
    }
  } else {
    list = scopeMock();
  }
  list = list.filter((m) => !m.finished);
  if (day !== null) list = list.filter((m) => sameDay(m.start, day));
  return remember(list.sort((a, b) => a.start.localeCompare(b.start)));
}

export async function getLiveMatches() {
  return remember(mockLiveMatches());
}

export async function getMatchById(id) {
  if (byId.has(id)) return byId.get(id);
  remember(mockMatches());
  remember(mockLiveMatches());
  return byId.get(id) || null;
}

export function countBySport() {
  const counts = {};
  for (const m of mockMatches()) if (!m.finished) counts[m.sport] = (counts[m.sport] || 0) + 1;
  return counts;
}

export { LEAGUES };
