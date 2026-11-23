import { MAX_SELECTIONS, MAX_STAKE, MIN_STAKE } from '../context/BetSlipContext.jsx';
import { fmtBRL } from '../format.js';

export default function Regulamento() {
  return (
    <div className="contentPages">
      <h1 className="pageTitle">Regulamento</h1>
      <div className="rules">
        <p className="infoBar">Este é um projeto de demonstração. Nenhuma aposta envolve dinheiro real.</p>
        <h2>1. Apostas</h2>
        <ul>
          <li>Valor mínimo por bilhete: {fmtBRL(MIN_STAKE)}. Valor máximo: {fmtBRL(MAX_STAKE)}.</li>
          <li>Um bilhete pode ter até {MAX_SELECTIONS} palpites, um por partida.</li>
          <li>A cotação total é o produto das cotações de cada palpite.</li>
          <li>Possível retorno = valor apostado × cotação total.</li>
        </ul>
        <h2>2. Resultados</h2>
        <ul>
          <li>Os mercados consideram apenas o tempo regulamentar (90 minutos mais acréscimos), salvo indicação em contrário.</li>
          <li>Partidas adiadas ou canceladas têm o palpite anulado (cotação 1,00).</li>
        </ul>
        <h2>3. Conferência</h2>
        <ul>
          <li>Use o código do bilhete na página Conferir Bilhete para ver os palpites e o status.</li>
        </ul>
        <h2>4. Jogo responsável</h2>
        <ul>
          <li>Proibido para menores de 18 anos.</li>
        </ul>
      </div>
    </div>
  );
}
