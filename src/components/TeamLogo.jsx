// Escudo genérico: círculo com as iniciais do time e cor derivada do nome.
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 38%)`;
}

function initials(name) {
  const parts = name.replace(/[^\p{L}\s.-]/gu, '').split(/[\s.-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeamLogo({ name, size = 25 }) {
  return (
    <span
      className="teamLogo"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
