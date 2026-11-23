import { Link } from 'react-router-dom';

// Aviso permanente: deixa claro para qualquer visitante que é demonstração.
export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <strong>Raposão</strong> — projeto de demonstração. Odds e jogos ilustrativos, apostas e
      depósitos simulados. <b>Nenhum valor é dinheiro real.</b> Não é uma casa de apostas e não
      aceita pagamentos. Proibido para menores de 18 anos.
      <span className="siteFooter-links">
        <Link to="/admin">Painel do operador</Link>
      </span>
    </footer>
  );
}
