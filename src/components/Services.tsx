type Service = {
  num: string;
  name: string;
  desc: string;
  price: string;
};

const SERVICES: Service[] = [
  {
    num: "01",
    name: "Retratos",
    desc: "Sessões individuais, familiares e editoriais. Estúdio ou exterior.",
    price: "desde 45€",
  },
  {
    num: "02",
    name: "Casamentos",
    desc: "Reportagem natural do dia inteiro.",
    price: "sob consulta",
  },
  {
    num: "03",
    name: "Eventos",
    desc: "Batizados, festas privadas, lançamentos. Cobertura discreta.",
    price: "55€ hora",
  },
  {
    num: "04",
    name: "Branding",
    desc: "Marcas, espaços, produto. Direção de arte incluída.",
    price: "sob consulta",
  },
];

export function Services() {
  return (
    <section className="services-editorial px-6 py-20 sm:px-12 sm:py-28" id="services">
      <div className="mx-auto max-w-5xl">
        <header className="reveal grid md:grid-cols-12 gap-6 mb-12 sm:mb-16">
          <div className="md:col-span-7">
            <p className="text-[0.68rem] uppercase tracking-[0.25em] text-accent mb-3">
              — Serviços
            </p>
            <h2 className="font-serif text-[2.8rem] sm:text-[3.5rem] font-light leading-[1.05] text-ink">
              Quatro formas de
              <br />
              <em className="italic text-warm-mid">trabalharmos juntos.</em>
            </h2>
          </div>
          <p className="md:col-span-4 md:col-start-9 text-[0.85rem] leading-[1.8] text-warm-mid md:pt-7">
            Cada sessão começa com uma chamada. Quero perceber o que queres
            lembrar antes de pensar em como fotografar.
          </p>
        </header>

        <div className="services-list reveal">
          {SERVICES.map((service) => (
            <ServiceLink key={service.num} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceLink({ service }: { service: Service }) {
  const [firstName, ...restName] = service.name.split(" ");
  const [priceLead, ...priceRest] = service.price.split(" ");

  return (
    <a
      href="#contact"
      className="service"
      aria-label={`${service.name} — ${service.price}`}
    >
      <span className="service-num">{service.num}</span>
      <span className="service-name">
        {firstName}
        {restName.length > 0 && <em> {restName.join(" ")}</em>}
      </span>
      <span className="service-desc">{service.desc}</span>
      <span className="price">
        {priceLead}
        {priceRest.length > 0 && <em> {priceRest.join(" ")}</em>}
      </span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
