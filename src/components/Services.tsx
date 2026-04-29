// Pacotes inicialmente hardcoded mas estruturados como dados — passo seguinte
// é mover para a DB se a Cláudia quiser editá-los a partir do painel.
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
    <section className="px-12 py-24" id="services">
      <header className="reveal mb-12">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-2">
          Investimento
        </p>
        <h2 className="font-serif text-5xl font-light leading-[1.1]">
          Serviços &<br />
          <em className="italic text-warm-mid">preços</em>
        </h2>
      </header>

      <div className="grid md:grid-cols-3 gap-[2px]">
        {SERVICES.map((s) => (
          <article
            key={s.number}
            className="reveal group relative overflow-hidden border border-warm-light hover:border-section-dark transition-colors p-12 before:absolute before:inset-0 before:bg-section-dark before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-[500ms]"
          >
            <div className="relative z-[1]">
              <div className="font-serif text-6xl font-light text-warm-light group-hover:text-accent/25 leading-none mb-6 transition-colors">
                {s.number}
              </div>
              <h3 className="font-serif text-2xl font-light text-ink group-hover:text-cream mb-4 transition-colors">
                {s.name}
              </h3>
              <p className="text-[0.82rem] leading-[1.8] text-warm-mid group-hover:text-cream/55 mb-8 transition-colors">
                {s.desc}
              </p>
              <div className="font-serif text-3xl font-light text-accent flex items-baseline gap-1">
                <span>{s.price}</span>
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.1em] text-warm-mid group-hover:text-cream/40 transition-colors">
                  {s.label}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
