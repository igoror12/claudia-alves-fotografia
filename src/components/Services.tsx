"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";

const SERVICES = [
  {
    number: "01",
    name: "Retratos",
    desc: "Sessões individuais, familiares e editoriais. Estúdio ou exterior.",
    price: "desde €220",
    imagePosition: "50% 35%",
  },
  {
    number: "02",
    name: "Casamentos",
    desc: "Reportagem natural do dia inteiro. Duas máquinas, sem poses.",
    price: "desde €1.450",
    imagePosition: "50% 45%",
  },
  {
    number: "03",
    name: "Eventos",
    desc: "Batizados, festas privadas, lançamentos. Cobertura discreta.",
    price: "desde €380",
    imagePosition: "50% 55%",
  },
  {
    number: "04",
    name: "Editorial",
    desc: "Marcas, espaços, produto. Direção de arte incluída.",
    price: "sob consulta",
    imagePosition: "50% 65%",
  },
];

export function Services() {
  const [activeIndex, setActiveIndex] = useState(1);
  const active = SERVICES[activeIndex];

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

        <div
          className="services-stage reveal relative border-y border-warm-light"
          style={{ "--active-service": activeIndex } as CSSProperties}
        >
          <ul className="services-list">
            {SERVICES.map((service, index) => (
              <li
                key={service.number}
                className={`service-line ${activeIndex === index ? "is-active" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
              >
                <a
                  href="#contact"
                  className="service-line-link"
                  aria-label={`${service.name} — ${service.price}`}
                >
                  <span className="service-line-num">{service.number}</span>
                  <span className="service-line-name">{service.name}</span>
                  <span className="service-line-desc">{service.desc}</span>
                  <span className="service-line-price">
                    {service.price.startsWith("desde") ? (
                      <>
                        <span>desde</span>
                        <em>{service.price.replace("desde ", "")}</em>
                      </>
                    ) : (
                      <em>{service.price}</em>
                    )}
                  </span>
                  <span className="service-line-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="service-active-preview" aria-hidden="true">
            <div className="service-active-card">
              <Image
                src="/images/claudia.jpg"
                alt=""
                fill
                sizes="260px"
                className="object-cover"
                style={{ objectPosition: active.imagePosition }}
              />
              <div className="service-active-scrim" />
            </div>
            <div className="service-active-label">Ver</div>
          </div>
        </div>
      </div>
    </section>
  );
}
