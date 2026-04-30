const SERVICES = [
  {
    number: "01",
    name: "Retrato Pessoal",
    desc: "Sessão individual ou familiar num local à tua escolha. Inclui seleção de 30 fotografias editadas em alta resolução e galeria online privada.",
    price: "€250",
    label: "/ sessão",
  },
  {
    number: "02",
    name: "Casamento Completo",
    desc: "Cobertura do dia inteiro, desde a preparação até à festa. Entrega de galeria online com mais de 500 fotografias editadas em alta resolução.",
    price: "€1.500",
    label: "/ dia",
  },
  {
    number: "03",
    name: "Evento Corporativo",
    desc: "Cobertura profissional de eventos empresariais, lançamentos de produto, conferências e festas de empresa. Entrega em 48h.",
    price: "€600",
    label: "/ evento",
  },
];

export function Services() {
  return (
    <section className="px-6 py-20 sm:px-12 sm:py-24" id="services">
      <header className="reveal mb-12">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
          Investimento
        </p>
        <h2 className="font-serif text-[2.8rem] font-light leading-[1.1]">
          Serviços &<br />
          <em className="italic text-warm-mid">preços</em>
        </h2>
      </header>

      <div className="grid md:grid-cols-3 gap-[2px]">
        {SERVICES.map((s) => (
          <article key={s.number} className="service-card reveal">
            <div className="s-num font-serif text-[4rem] font-light leading-none mb-6">
              {s.number}
            </div>
            <h3 className="s-name font-serif text-[1.5rem] font-light mb-4">
              {s.name}
            </h3>
            <p className="s-desc text-[0.82rem] leading-[1.8] mb-8">{s.desc}</p>
            <div className="font-serif text-[1.8rem] font-light text-accent flex items-baseline gap-1">
              <span>{s.price}</span>
              <span className="s-price-label font-sans text-[0.7rem] uppercase tracking-[0.1em]">
                {s.label}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
