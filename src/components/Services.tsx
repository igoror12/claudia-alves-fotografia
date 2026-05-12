"use client";

import { useRef } from "react";

/**
 * Serviços apresentados como lista vertical (não cards) — formato editorial
 * típico de fotógrafos premium (referência: Magnum, Aperture, Adolfo Bezerra).
 *
 * Interações por linha:
 * - separador hairline entre items
 * - hover: brown rises from bottom, texto inverte para cream, preço bronze,
 *   seta desliza para a direita, preview de fotografia inclinada segue cursor
 * - preview desativada em mobile/touch via media query CSS
 *
 * Preview position usa refs (não state) para evitar re-renders em mousemove.
 * Posiciona ligeiramente à direita do cursor com rotação subtil -4°.
 */
const SERVICES = [
  {
    number: "01",
    name: "Retratos",
    desc: "Sessões individuais, familiares e editoriais. Estúdio ou exterior.",
    price: "desde €220",
    preview: "from-[#8C6A54] via-[#B28E74] to-[#D4B89C]",
  },
  {
    number: "02",
    name: "Casamentos",
    desc: "Reportagem natural do dia inteiro. Duas máquinas, sem poses.",
    price: "desde €1.450",
    preview: "from-[#4A3C2E] via-[#7A6050] to-[#A88060]",
  },
  {
    number: "03",
    name: "Eventos",
    desc: "Batizados, festas privadas, lançamentos. Cobertura discreta.",
    price: "desde €380",
    preview: "from-[#5A4A3A] via-[#8C7060] to-[#B09080]",
  },
  {
    number: "04",
    name: "Editorial",
    desc: "Marcas, espaços, produto. Direção de arte incluída.",
    price: "sob consulta",
    preview: "from-[#6B5848] via-[#9A8070] to-[#C8A890]",
  },
];

export function Services() {
  return (
    <section className="px-6 py-20 sm:px-12 sm:py-28" id="services">
      <header className="reveal grid md:grid-cols-12 gap-6 mb-16">
        <div className="md:col-span-7">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-accent mb-3">
            — Serviços
          </p>
          <h2 className="font-serif text-[2.8rem] sm:text-[3.5rem] font-light leading-[1.05] text-ink">
            Quatro formas de
            <br />
            <em className="italic text-warm-mid">trabalharmos juntos.</em>
          </h2>
        </div>
        <p className="md:col-span-4 md:col-start-9 text-[0.85rem] leading-[1.8] text-warm-mid md:pt-6">
          Cada sessão começa com uma chamada. Quero perceber o que queres
          lembrar antes de pensar em como fotografar.
        </p>
      </header>

      <ul className="services-list border-t border-warm-light">
        {SERVICES.map((s) => (
          <ServiceRow key={s.number} {...s} />
        ))}
      </ul>
    </section>
  );
}

function ServiceRow({
  number,
  name,
  desc,
  price,
  preview,
}: {
  number: string;
  name: string;
  desc: string;
  price: string;
  preview: string;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent) {
    if (!previewRef.current || !rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // posiciona à direita-cima do cursor, com rotação subtil
    previewRef.current.style.transform = `translate(${x + 32}px, ${y - 130}px) rotate(-4deg)`;
  }

  return (
    <li
      ref={rowRef}
      className="service-row reveal group relative border-b border-warm-light"
      onMouseMove={onMouseMove}
    >
      <a
        href="#contact"
        className="service-row-link relative z-[1] grid grid-cols-12 items-center gap-4 sm:gap-8 px-2 py-7 sm:py-9"
        aria-label={`${name} — ${price}`}
      >
        <span className="service-num col-span-2 sm:col-span-1 font-mono text-[0.7rem] tracking-[0.15em] text-warm-mid">
          {number}
        </span>
        <h3 className="service-name col-span-10 sm:col-span-3 font-serif text-[1.6rem] sm:text-[2rem] font-light text-ink leading-none">
          {name}
        </h3>
        <p className="service-desc hidden sm:block sm:col-span-5 text-[0.85rem] leading-[1.6] text-warm-mid">
          {desc}
        </p>
        <span className="service-price col-span-10 sm:col-span-2 font-serif text-[1.1rem] sm:text-[1.25rem] text-warm-mid font-light">
          {price.startsWith("desde") ? (
            <>
              <span className="text-warm-mid/70 text-[0.85rem] mr-1">desde</span>
              <em className="not-italic">{price.replace("desde ", "")}</em>
            </>
          ) : (
            <em className="not-italic italic text-warm-mid/70 text-[0.95rem]">
              {price}
            </em>
          )}
        </span>
        <span
          aria-hidden="true"
          className="service-arrow col-span-2 sm:col-span-1 justify-self-end inline-flex items-center justify-center w-10 h-10 rounded-full border border-warm-light/60 text-warm-mid transition-all duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        >
          →
        </span>
      </a>

      {/* Preview que segue o cursor — só em desktop com hover preciso */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className={`service-preview pointer-events-none absolute top-0 left-0 z-[2] w-[260px] h-[320px] bg-gradient-to-br ${preview} shadow-[0_30px_60px_-20px_rgba(46,40,32,0.45)] opacity-0 transition-opacity duration-300`}
      >
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full opacity-[0.18]"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <ellipse cx="50" cy="35" rx="22" ry="24" fill="white" />
          <path d="M10 120 C10 70 90 70 90 120" fill="white" />
        </svg>
      </div>
    </li>
  );
}
