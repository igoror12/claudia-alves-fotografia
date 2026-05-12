const ITEMS = [
  "Retratos",
  "\u2726",
  "Casamentos",
  "\u2726",
  "Eventos",
  "\u2726",
  "Editorial",
  "\u2726",
  "Fam\u00edlia",
  "\u2726",
];

const LOOP = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

export function Marquee() {
  return (
    <div className="marquee" aria-label="Tipos de sessoes fotograficas">
      <div className="marquee-track" aria-hidden="true">
        {LOOP.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
