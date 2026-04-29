export function Marquee() {
  // Duplicado intencionalmente para o loop ser contínuo (translateX -50%)
  const items = ["Retratos", "Casamentos", "Eventos", "Braga · Portugal"];
  const all = [...items, ...items];

  return (
    <div className="marquee-band">
      <div className="marquee-inner">
        {all.map((item, i) => (
          <span
            key={i}
            className="font-serif text-lg italic font-light text-cream tracking-[0.05em] opacity-75 flex-shrink-0"
          >
            {item}
            <span className="text-accent ml-12 not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
