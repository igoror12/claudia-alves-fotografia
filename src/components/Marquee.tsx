// Reproduz fielmente o ritmo do protótipo: items de texto e estrelas
// como elementos SEPARADOS, espaçados uniformemente. A duplicação é
// intencional para criar o loop infinito sem "salto" visual.
const ITEMS = ["Retratos", "Casamentos", "Eventos", "Braga · Portugal"];

function buildSequence(): { type: "text" | "dot"; value: string }[] {
  const seq: { type: "text" | "dot"; value: string }[] = [];
  for (const item of ITEMS) {
    seq.push({ type: "text", value: item });
    seq.push({ type: "dot", value: "✦" });
  }
  return [...seq, ...seq];
}

export function Marquee() {
  const all = buildSequence();

  return (
    <div className="marquee-band">
      <div className="marquee-inner">
        {all.map((entry, i) =>
          entry.type === "text" ? (
            <span
              key={i}
              className="font-serif text-[1.1rem] italic font-light text-cream tracking-[0.05em] opacity-75 flex-shrink-0"
            >
              {entry.value}
            </span>
          ) : (
            <span key={i} className="text-[1.1rem] text-accent flex-shrink-0">
              {entry.value}
            </span>
          )
        )}
      </div>
    </div>
  );
}
