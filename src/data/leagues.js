// Esportes e campeonatos. `apiKey` é o identificador do campeonato na The Odds API.
export const SPORTS = [
  { id: 'futebol', name: 'Futebol', icon: '⚽', hasDraw: true },
  { id: 'basquete', name: 'Basquete', icon: '🏀', hasDraw: false },
  { id: 'tenis', name: 'Tênis', icon: '🎾', hasDraw: false },
  { id: 'lutas', name: 'Lutas', icon: '🥊', hasDraw: false },
  { id: 'volei', name: 'Voleibol', icon: '🏐', hasDraw: false },
  { id: 'fut-americano', name: 'Futebol Americano', icon: '🏈', hasDraw: false },
  { id: 'hoquei', name: 'Hóquei no Gelo', icon: '🏒', hasDraw: false },
];

export const LEAGUES = [
  {
    id: 'brasileirao', sport: 'futebol', country: 'Brasil', flag: 'br', name: 'Brasileirão Série A',
    apiKey: 'soccer_brazil_campeonato',
    teams: ['Flamengo', 'Palmeiras', 'Botafogo', 'Fortaleza', 'Internacional', 'São Paulo', 'Corinthians', 'Bahia', 'Cruzeiro', 'Vasco da Gama', 'Atlético-MG', 'Grêmio', 'Fluminense', 'Bragantino', 'Juventude', 'Vitória', 'Santos', 'Ceará', 'Sport', 'Mirassol'],
  },
  {
    id: 'serie-b', sport: 'futebol', country: 'Brasil', flag: 'br', name: 'Brasileirão Série B',
    apiKey: 'soccer_brazil_serie_b',
    teams: ['Coritiba', 'Goiás', 'Novorizontino', 'Remo', 'Chapecoense', 'Criciúma', 'Avaí', 'Cuiabá', 'Athletico-PR', 'Vila Nova', 'Operário-PR', 'América-MG', 'CRB', 'Paysandu', 'Ferroviária', 'Botafogo-SP'],
  },
  {
    id: 'libertadores', sport: 'futebol', country: 'América do Sul', flag: 'sa', name: 'Copa Libertadores',
    apiKey: 'soccer_conmebol_copa_libertadores',
    teams: ['Flamengo', 'Palmeiras', 'River Plate', 'Boca Juniors', 'Racing', 'Estudiantes', 'LDU Quito', 'Peñarol', 'Vélez Sarsfield', 'Botafogo', 'Nacional', 'Independiente del Valle'],
  },
  {
    id: 'champions', sport: 'futebol', country: 'Europa', flag: 'eu', name: 'Liga dos Campeões',
    apiKey: 'soccer_uefa_champs_league',
    teams: ['Real Madrid', 'Manchester City', 'Bayern de Munique', 'PSG', 'Barcelona', 'Inter de Milão', 'Liverpool', 'Arsenal', 'Borussia Dortmund', 'Atlético de Madrid', 'Benfica', 'Juventus'],
  },
  {
    id: 'premier', sport: 'futebol', country: 'Inglaterra', flag: 'gb-eng', name: 'Premier League',
    apiKey: 'soccer_epl',
    teams: ['Arsenal', 'Liverpool', 'Manchester City', 'Chelsea', 'Newcastle', 'Aston Villa', 'Tottenham', 'Manchester United', 'Brighton', 'West Ham', 'Nottingham Forest', 'Bournemouth', 'Fulham', 'Brentford', 'Crystal Palace', 'Everton'],
  },
  {
    id: 'laliga', sport: 'futebol', country: 'Espanha', flag: 'es', name: 'La Liga',
    apiKey: 'soccer_spain_la_liga',
    teams: ['Real Madrid', 'Barcelona', 'Atlético de Madrid', 'Athletic Bilbao', 'Villarreal', 'Real Sociedad', 'Real Betis', 'Sevilla', 'Valencia', 'Girona', 'Celta de Vigo', 'Osasuna'],
  },
  {
    id: 'serie-a', sport: 'futebol', country: 'Itália', flag: 'it', name: 'Serie A',
    apiKey: 'soccer_italy_serie_a',
    teams: ['Inter de Milão', 'Napoli', 'Juventus', 'Milan', 'Atalanta', 'Roma', 'Lazio', 'Fiorentina', 'Bologna', 'Torino', 'Como', 'Udinese'],
  },
  {
    id: 'bundesliga', sport: 'futebol', country: 'Alemanha', flag: 'de', name: 'Bundesliga',
    apiKey: 'soccer_germany_bundesliga',
    teams: ['Bayern de Munique', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Eintracht Frankfurt', 'Stuttgart', 'Freiburg', 'Wolfsburg', 'Mainz', 'Werder Bremen'],
  },
  {
    id: 'ligue1', sport: 'futebol', country: 'França', flag: 'fr', name: 'Ligue 1',
    apiKey: 'soccer_france_ligue_one',
    teams: ['PSG', 'Olympique de Marseille', 'Monaco', 'Lille', 'Lyon', 'Nice', 'Lens', 'Rennes', 'Strasbourg', 'Nantes'],
  },
  {
    id: 'nba', sport: 'basquete', country: 'EUA', flag: 'us', name: 'NBA',
    apiKey: 'basketball_nba',
    teams: ['Boston Celtics', 'Denver Nuggets', 'Oklahoma City Thunder', 'Los Angeles Lakers', 'Golden State Warriors', 'New York Knicks', 'Milwaukee Bucks', 'Dallas Mavericks', 'Miami Heat', 'Phoenix Suns', 'Cleveland Cavaliers', 'Minnesota Timberwolves'],
  },
  {
    id: 'nbb', sport: 'basquete', country: 'Brasil', flag: 'br', name: 'NBB',
    apiKey: null,
    teams: ['Franca', 'Flamengo', 'Minas', 'Sesi Franca', 'Pinheiros', 'São Paulo', 'Corinthians', 'Bauru', 'Paulistano', 'Brasília'],
  },
  {
    id: 'atp', sport: 'tenis', country: 'Mundo', flag: 'world', name: 'ATP Tour',
    apiKey: null,
    teams: ['J. Sinner', 'C. Alcaraz', 'N. Djokovic', 'A. Zverev', 'D. Medvedev', 'T. Fritz', 'C. Ruud', 'J. Fonseca', 'A. de Minaur', 'H. Rune', 'S. Tsitsipas', 'B. Shelton'],
  },
  {
    id: 'ufc', sport: 'lutas', country: 'Mundo', flag: 'world', name: 'UFC',
    apiKey: 'mma_mixed_martial_arts',
    teams: ['A. Pereira', 'I. Makhachev', 'C. Oliveira', 'J. Jones', 'T. Aspinall', 'D. du Plessis', 'S. O\'Malley', 'M. Dvalishvili', 'A. Pantoja', 'I. Topuria', 'B. Moreno', 'J. Aldo'],
  },
  {
    id: 'superliga', sport: 'volei', country: 'Brasil', flag: 'br', name: 'Superliga',
    apiKey: null,
    teams: ['Sada Cruzeiro', 'Minas', 'Itambé', 'Praia Clube', 'Sesi Bauru', 'Osasco', 'Joinville', 'Suzano', 'Campinas', 'Guarulhos'],
  },
  {
    id: 'nfl', sport: 'fut-americano', country: 'EUA', flag: 'us', name: 'NFL',
    apiKey: 'americanfootball_nfl',
    teams: ['Kansas City Chiefs', 'Philadelphia Eagles', 'Buffalo Bills', 'Baltimore Ravens', 'Detroit Lions', 'San Francisco 49ers', 'Green Bay Packers', 'Dallas Cowboys', 'Cincinnati Bengals', 'Houston Texans'],
  },
  {
    id: 'nhl', sport: 'hoquei', country: 'EUA', flag: 'us', name: 'NHL',
    apiKey: 'icehockey_nhl',
    teams: ['Florida Panthers', 'Edmonton Oilers', 'Dallas Stars', 'Colorado Avalanche', 'New York Rangers', 'Toronto Maple Leafs', 'Vegas Golden Knights', 'Boston Bruins', 'Carolina Hurricanes', 'Winnipeg Jets'],
  },
];

export const sportById = (id) => SPORTS.find((s) => s.id === id);
export const leagueById = (id) => LEAGUES.find((l) => l.id === id);
export const leaguesOfSport = (sportId) => LEAGUES.filter((l) => l.sport === sportId);
