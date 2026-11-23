// Bandeira por código ISO (imagens do flagcdn.com). Códigos sem bandeira viram um globo.
const GLOBES = { sa: '🌎', world: '🌍' };

export default function Flag({ code }) {
  if (GLOBES[code] || !code) return <span className="flagGlobe">{GLOBES[code] || '🏳️'}</span>;
  return <img className="flagImg" src={`https://flagcdn.com/w40/${code}.png`} alt="" width="20" height="14" loading="lazy" />;
}
