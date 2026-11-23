# Arena Odds

Front-end de apostas esportivas em React + Vite (projeto de demonstração, sem dinheiro real).

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5180 (no celular, na mesma rede Wi-Fi: http://IP-do-PC:5180)

## Odds reais (opcional)

Por padrão o site usa jogos e odds de exemplo, gerados em `src/data/mock.js`.
Para usar odds reais da [The Odds API](https://the-odds-api.com) (plano gratuito com 500 requisições/mês):

1. Crie uma conta e copie sua chave.
2. Copie `.env.example` para `.env` e preencha `VITE_ODDS_API_KEY`.
3. Reinicie `npm run dev`.

Os campeonatos com `apiKey` em `src/data/leagues.js` passam a vir da API (cache de 5 minutos).
Os que não têm cobertura continuam com dados de exemplo. A página Ao Vivo é sempre simulada.

## Estrutura

- `src/api/odds.js`: camada de dados (API real ou dados de exemplo)
- `src/data/leagues.js`: esportes e campeonatos do menu
- `src/data/mock.js`: gerador de jogos, odds e mercados extras
- `src/context/BetSlipContext.jsx`: cupom, bilhetes e login (salvos no localStorage)
- `src/components/`: Sidebar, Topbar, EventList (cards de jogos), BetSlip (cupom)
- `src/pages/`: Jogos, AoVivo, Partida (+ mercados), ConferirBilhete, Regulamento, Login
