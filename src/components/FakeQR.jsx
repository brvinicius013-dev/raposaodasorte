// QR DECORATIVO. Não codifica chave PIX nem payload nenhum — é só um padrão
// visual gerado a partir de um texto, para a tela de demonstração. Não é escaneável.
function seeded(str) {
  let h = 2166136261;
  return () => {
    h ^= str.charCodeAt((h >>> 3) % str.length || 0);
    h = Math.imul(h, 16777619);
    return ((h >>> 0) % 1000) / 1000;
  };
}

const N = 25; // módulos por lado

function isFinder(r, c) {
  // três "olhos" nos cantos, como num QR de verdade
  const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
  const corners = [
    [0, 0],
    [0, N - 7],
    [N - 7, 0],
  ];
  for (const [br, bc] of corners) {
    if (inBox(br, bc)) {
      const rr = r - br;
      const cc = c - bc;
      const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      return ring || core ? 'on' : 'off';
    }
  }
  return null;
}

export default function FakeQR({ seed = 'demo', size = 200 }) {
  const rand = seeded(seed + '::arena');
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const finder = isFinder(r, c);
      const on = finder ? finder === 'on' : rand() > 0.52;
      cells.push(on);
    }
  }
  return (
    <div
      className="fakeQR"
      style={{ width: size, height: size, gridTemplate: `repeat(${N}, 1fr) / repeat(${N}, 1fr)` }}
      role="img"
      aria-label="QR Code de demonstração (não escaneável)"
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? 'on' : ''} />
      ))}
    </div>
  );
}
