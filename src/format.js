const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const DIAS = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];

export const fmtOdd = (n) => (n ? n.toFixed(2).replace('.', ',') : '-');
export const fmtBRL = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function fmtDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${MESES[d.getMonth()]}`;
}

export function fmtHour(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function dayName(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return DIAS[d.getDay()];
}

export function fmtDateTime(iso) {
  return `${fmtDate(iso)} ${fmtHour(iso)}`;
}
