// Proxy serverless (Vercel) para a The Odds API.
// A chave fica em ODDS_API_KEY (variável de ambiente do SERVIDOR) e nunca é enviada ao navegador.
const BASE = 'https://api.the-odds-api.com/v4';

export default async function handler(req, res) {
  const key = process.env.ODDS_API_KEY;
  if (!key) return res.status(503).json({ error: 'ODDS_API_KEY nao configurada' });

  const sport = String(req.query.sport || '');
  if (!/^[a-z0-9_]{3,60}$/.test(sport)) return res.status(400).json({ error: 'sport invalido' });

  const url = `${BASE}/sports/${sport}/odds/?apiKey=${key}&regions=eu&markets=h2h&oddsFormat=decimal`;
  try {
    const r = await fetch(url);
    if (r.status === 404 || r.status === 422) return res.status(200).json([]); // fora de temporada
    if (!r.ok) return res.status(502).json({ error: `upstream ${r.status}` });
    const data = await r.json();
    // cache na borda da Vercel: poupa a cota da The Odds API
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: 'falha ao consultar upstream' });
  }
}
